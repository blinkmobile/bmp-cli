# Suggested Usage


## Getting Started

1. make a new project directory, make it your current working directory (a.k.a. CWD)

    - `cd` ...

2. set the project scope to the online URL for your project

    - `blinkm bmp scope https://example.com/project`

    - this saves this information in a `.blinkmrc.json` file in the CWD, so you can version it with your project files if you like

    - you may have to repeat this step later if you work on a new project, or if you chose not to version the `.blinkmrc.json` file

3. copy your credentials from our administration CMS and use them to authenticate

    - note: this step will have more useful CMS details, pending review

    - `blinkm bmp login`, paste your credentials when prompted, hit enter

    - these are _not_ stored in the CWD, so you will not risk versioning them by mistake

    - you may have to repeat this step later if you invalidate your remote credentials, or if you work on a different project with a different origin

4. double-check that you're logged in as expected

    - `blinkm bmp whoami`


## Download Project Content

1. if you are already using version control, then we recommend that you save any local changes and commit or stash them

2. populate files in your local CWD with data from our service

    - `blinkm bmp pull`

    - if you are already using version control, then you should be able to compare the changes just made by this CLI against the last committed version

3. if you have not already committed this downloaded content to your version control system, then we'd recommend doing so now


### Hints

- we expect that you will need to do this once for each project to bootstrap your local copy of the project files for version control purposes

- you may also find this useful, in combination with version control, to audit the remote project for unexpected changes


## Edit Project Content

- you may use tools of your own choosing to edit these project files

- if you still need a web-based approach to edit your projects, consider using the web-based console that your version control system provides, although our CMS will still be there just in case

- we recommend versioning test files with your project, so that you have a local pre-release method of validating recent changes


## Version Control Hints

- if your project content includes sensitive material, then be sure to use a **private** version control repository

- if you are using a version control system, then we suggest

    - treating the version control copy as the canonical / definitive copy, and

    - avoiding modifications directly within the CMS or any avenue that is not this CLI

- you may find it convenient to version the `.blinkmrc.json` with different scopes to different project branches, although we recommend taking extra care when doing so

- you may find it useful to configure Continuous Integration, so that each commit automatically triggers your test code (if any)


## Deploy Project Content

1. if you are using a version control system, we'd recommend coordinating with your team to ensure your local CWD contains all desired changes

2. double-check that you will be deploying to the expected remote project

    - `blinkm bmp scope`

3. double-check that you have authenticated as expected

    - `blinkm bmp whoami`

4. send your local project files to our service for immediate deployment

    - `blinkm bmp deploy`


### Hint

- we recommend having a nominated release manager (or two, just in case) to discourage unexpected deployments

    - it can be a good idea to rotate this responsibility, but we recommend limiting this responsibility at any one time
