# Versus

Javascript CLI that works like Maven/Gradle for Java.

Versus Provides two Different CLI that provide different stuff.
- Versus (Normal Versus CLI): For initializing a project or installing package, etc
- Versus Jsar: Packs the source directory into a jsar file that can be ran using `versus-jsar run <jsarfile>`

Versus Works like java by using classes basically like com.example.Main which is the main file which can be ran from the cli.


# !!! This still development !!!
Do not expect much utilities/commands into the API/CLI since it is not complete yet.

# Documentation
- [CLI](#cli)
    - [Installation](#installation)
    - [Getting Started](#getting-started)
    - [Building](#building)

# CLI
- ## Installation:
    The Installation is very simple thing to get started with the versus cli. All you have todo is run:
    ```
    npm install --location=global versus.js
    ```
    or with older versions:
    ```
    npm install --global versus.js
    ```
- ## Getting Started
    To get Started with the Versus CLI you will have to instantiate a project by using
    ```
    versus init
    ```
    This will create a project with the filesystem looking like this:
    ```
    :root
      > src
        > main
          > javascript (main code)
          > resources
          
        > test
          > javascript (test code)
          > resources (test resources)

      - versus.config.json (Versus config)
      - package.json (npm packager config)
    ```

    The second thing you wanna do is look through the `<versus.config.json>` it should look something like this:
    ```json
    {
        "$VERSION": "VERSUS VERSION DO NOT CHANGE",
        "name": "Project Name (Must be all lowercase without spaces)",
        "version": "Project version",
        "description": "Project Description",
        "license": "License (Default: MIT)",
        "main": "Javascript Main file (Default: com.example.Main)"
    }
    ```
    - **Note**: That the main field is needed always when you want to run the project. It also needs to look just something like: `"com.example.Main"`

    Once whe are done creating the project there should be a com.example package or com/example folder in your src folder including the Main.js file.

    You can edit this file as you wish once your done you can run
    ```
    versus run
    ```
    It would straight run the file using nodejs.
- ## Building
Here where the packaging into a file happens.

To build your project you must instantiate the project before you build it! It wouldn't work because no versus config file no work.

After you instantiate the project and you are good to go you can run the command given below:
```
versus-jsar build
```

What this command will do is copy source files from src/main such as resources and source code and places it into a folder called build. It also copies the versus.config.json which is needed later.

Once the copying is done the jsar cli packages them into a jsar file from the build directory.

And if it succeeded it would be found under the out folder which should be named like this: `<PROJECT_NAME>.jsar` - The project name is included in the versus config (Field name).

- ## Running a jsar
To run a jsar file all you have to do is run:
```
versus-jsar run <jsarfile>
```

What this will do is unpack the jsar file into a cache folder named `.versuscache`

Once all data is copied the versus cli takes the main field included in the versus config which is included within the jsar and runs the file.

After running the file and its done running it the jsar cli will delete the `.versuscache` folder.

# Made with <3
Thank you for using Versus CLI and hope you the great best!.

Made by Max Jackson with <3!