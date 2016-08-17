# Customisation

This tool has been designed with a few escape hatches for cases where the default behaviour is sub-optimal.


## Filename Extensions for Extracted Content

We have a hardcoded list of values that may be present within a JSON data structure.
These values are extracted out into separate files,
with default file extensions that we hope cover common use cases.

This tool scans JSON structures for `{ "$file": "filename.ext" }`.
This `"$file"` reference tells the tool which additional file contains the real value.
These references are honoured during each `pull` and `deploy`.

In order for many IDEs and code editors to properly highlight syntax,
the appropriate file extension should be used.
E.g. JSON files have a ".json" extension, JavaScript files use ".js", etc.


### Example

message.json (missing values not related to this document):

```json
{
  "config": {
    "default": {
      "message": {
        "$file": "message.json.message.json"
      }
    }
  },
  "id": "104708"
}
```

message.json.message.txt:

```txt
{
  "interactionName": "message.json",
  "message": "Hello, world!"
}
```

We have stored a JSON string as the value of `config.default.message`,
so it would be more convenient if the extracted content had a ".json" file extension.

1. do a `pull` first, as `"$file"` references are local-only

2. rename "message.json.message.txt" to "message.json.message.json"

3. change the `"$file"` reference in message.json to "message.json.message.json"

It is recommended that you commit these changes to version control,
so that you and other team members will not have to repeat these steps in future.


### Related Resources

We maintain a separate library to achieve this extraction:
- [@blinkmobile/json-as-files](https://github.com/blinkmobile/json-as-files.js)
