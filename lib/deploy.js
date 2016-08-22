'use strict';

// local modules

const api = require('./api');
const asyncp = require('./utils/asyncp');
const progress = require('./progress');
const resource = require('./resource');
const scope = require('./scope');
const validate = require('./validate');
const values = require('./values');

// this module

function deployAnswerSpace (options) {
  return resource.readCachedAnswerSpace(options)
    .then((data) => api.putResource({
      data,
      type: 'answerspaces',
      uid: data.name
    }));
}

function deployInteraction (options) {
  let isNew;
  return Promise.all([
    resource.readCachedAnswerSpace({ cwd: options.cwd }),
    resource.readInteraction(options)
  ])
    .then((results) => {
      const answerSpace = results[0];
      const data = results[1];
      isNew = !data.id;
      data.links = { answerspaces: answerSpace.id };
      return api.putResource({
        data,
        id: data.id,
        type: 'interactions',
        uid: answerSpace.name
      });
    })
    .then((result) => {
      if (isNew) {
        return resource.writeInteraction({
          cwd: options.cwd,
          data: result.interactions,
          name: result.interactions.name
        });
      }
    });
}

function deployFromPlan (options) { // options: { cwd, plan }
  const cwd = options.cwd;
  const plan = options.plan;
  const tasks = [];
  if (plan.answerSpace) {
    tasks.push(() => deployAnswerSpace({ cwd }));
  }
  if (plan.interactions.length) {
    tasks.push.apply(tasks, plan.interactions.map((name) => {
      return () => deployInteraction({ cwd: options.cwd, name });
    }));
  }
  if (!tasks.length) {
    // empty plan: probably not what the user intended
    throw new Error(values.ERROR_ONLY_NO_MATCHES);
  }
  progress.addWork(tasks.length);
  return asyncp.eachLimit(
    tasks,
    values.MAX_REQUESTS,
    asyncp.asyncify((task) => {
      return task()
        .then(() => progress.completeWork(1));
    })
  );
}

function wipeSiteMap (options) {
  return resource.readCachedAnswerSpace(options)
    .then((data) => api.wipeSiteMap({
      data,
      type: 'answerspaces',
      uid: data.name
    }));
}

function deployOnly (options) {
  options = options || {};
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  return validate.validateScopeMatchesContent({ cwd })
    // build tree of answerSpace/interactions, their JSONs, their $file references
    .then(() => resource.readLocalTree({ cwd }))
    // cull from the tree where `--only` doesn't match
    .then((tree) => resource.matchTreePaths(tree, options.filePaths))
    // simplify the tree into a plan now that we don't need the $file references
    .then((tree) => ({
      answerSpace: !!tree.answerSpace,
      interactions: Object.keys(tree.interactions)
    }))
    .then((plan) => deployFromPlan({ cwd, plan }))
    .then(() => wipeSiteMap({ cwd }));
}

/* create the default "everything" plan */
function planAll (options) { // options: { cwd }
  return resource.listInteractions({ cwd: options.cwd })
    .then((results) => results.map((result) => result.name))
    .then((names) => ({
      answerSpace: true,
      interactions: names
    }));
}

function pruneInteractions (options) {
  let uid;
  return scope.getUID()
    .then((u) => {
      uid = u;
      return uid;
    })
    .then((uid) => Promise.all([
      api.getResource({ uid, type: 'answerspaces' }),
      resource.listInteractions({ cwd: options.cwd })
    ]))
    .then((results) => {
      const remoteIds = results[0].answerspaces.links.interactions || [];
      const localIds = results[1].map((i) => i.id);
      const pruneIds = remoteIds.filter((id) => localIds.indexOf('' + id) === -1);
      progress.addWork(pruneIds.length);
      return pruneIds;
    })
    .then((pruneIds) => asyncp.eachLimit(pruneIds, values.MAX_REQUESTS, asyncp.asyncify((id) => {
      return api.deleteResource({ id, type: 'interactions', uid })
        .then(() => progress.completeWork(1));
    })));
}

function deployAll (options) {
  options = options || {};
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  return validate.validateScopeMatchesContent({ cwd })
    .then(() => planAll({ cwd }))
    .then((plan) => deployFromPlan({ cwd, plan }))
    .then(() => {
      if (options.prune) {
        return pruneInteractions({ cwd });
      }
    })
    .then(() => wipeSiteMap({ cwd }));
}

module.exports = {
  deployAll,
  deployInteraction,
  deployOnly,
  wipeSiteMap
};
