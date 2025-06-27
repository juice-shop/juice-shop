Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Overview
What are development containers?
As containerizing production workloads becomes commonplace, more developers are using containers for scenarios beyond deployment, including continuous integration, test automation, and even full-featured coding environments.

Each scenario’s needs can vary between simple single container environments to complex, orchestrated multi-container setups. Rather than attempting to create another orchestrator format, the Development Container Specification (or Dev Container Spec for short) seeks to find ways to enrich existing formats with metadata for common development specific settings, tools, and configuration.

A structured metadata format
Like the Language Server Protocol before it, the first format in the specification, devcontainer.json, was born out of necessity. It is a structured JSON with Comments (jsonc) metadata format that tools can use to store any needed configuration required to develop inside of local or cloud-based containerized coding.

Since the spec was initally published, dev container metadata can now be stored in image labels and in reusable chunks of metadata and install scripts known as Dev Container Features. We envision that this same structured data can be embedded in other formats – all while retaining a common object model for consistent processing.

Development vs production
A development container defines an environment in which you develop your application before you are ready to deploy. While deployment and development containers may resemble one another, you may not want to include tools in a deployment image that you use during development.

Diagram of inner and outer loop of container-based development

Build and test
Beyond repeatable setup, these same development containers provide consistency to avoid environment specific problems across developers and centralized build and test automation services. The open-source CLI reference implementation can either be used directly or integrated into product experience to use the structured metadata to deliver these benefits. It currently supports integrating with Docker Compose and a simplified, un-orchestrated single container option – so that they can be used as coding environments or for continuous integration and testing.

A GitHub Action and an Azure DevOps Task are available in devcontainers/ci for running a repository’s dev container in continuous integration (CI) builds. This allows you to reuse the same setup that you are using for local development to also build and test your code in CI.

Supporting tools
You can learn more about how other tools and services support the Development Container Specification.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Dev Container metadata reference
The devcontainer.json file contains any needed metadata and settings required to configurate a development container for a given well-defined tool and runtime stack. It can be used by tools and services that support the dev container spec to create a development environment that contains one or more development containers.

Metadata properties marked with a 🏷️️ can be stored in the devcontainer.metadata container image label in addition to devcontainer.json. This label can contain an array of json snippets that will be automatically merged with devcontainer.json contents (if any) when a container is created.

General devcontainer.json properties
Property	Type	Description
name	string	A name for the dev container displayed in the UI.
forwardPorts 🏷️	array	An array of port numbers or "host:port" values (e.g. [3000, "db:5432"]) that should always be forwarded from inside the primary container to the local machine (including on the web). The property is most useful for forwarding ports that cannot be auto-forwarded because the related process that starts before the devcontainer.json supporting service / tool connects or for forwarding a service not in the primary container in Docker Compose scenarios (e.g. "db:5432"). Defaults to [].
portsAttributes 🏷️	object	Object that maps a port number, "host:port" value, range, or regular expression to a set of default options. See port attributes for available options. For example:
"portsAttributes": {"3000": {"label": "Application port"}}
otherPortsAttributes 🏷️	object	Default options for ports, port ranges, and hosts that aren’t configured using portsAttributes. See port attributes for available options. For example:
"otherPortsAttributes": {"onAutoForward": "silent"}
containerEnv 🏷️	object	A set of name-value pairs that sets or overrides environment variables for the container. Environment and pre-defined variables may be referenced in the values. For example:
"containerEnv": { "MY_VARIABLE": "${localEnv:MY_VARIABLE}" }
If you want to reference an existing container variable while setting this one (like updating the PATH), use remoteEnv instead.
containerEnv will set the variable on the Docker container itself, so all processes spawned in the container will have access to it. But it will also be static for the life of the container - you must rebuild the container to update the value.
We recommend using containerEnv (over remoteEnv) as much as possible since it allows all processes to see the variable and isn’t client-specific.
remoteEnv 🏷️	object	A set of name-value pairs that sets or overrides environment variables for the devcontainer.json supporting service / tool (or sub-processes like terminals) but not the container as a whole. Environment and pre-defined variables may be referenced in the values.
You may want to use remoteEnv (over containerEnv) if the value isn’t static since you can update its value without having to rebuild the full container.
remoteUser 🏷️	string	Overrides the user that devcontainer.json supporting services tools / runs as in the container (along with sub-processes like terminals, tasks, or debugging). Does not change the user the container as a whole runs as which can be set using containerUser. Defaults to the user the container as a whole is running as (often root).
You may learn more in the remoteUser section below.
containerUser 🏷️	string	Overrides the user for all operations run as inside the container. Defaults to either root or the last USER instruction in the related Dockerfile used to create the image. If you want any connected tools or related processes to use a different user than the one for the container, see remoteUser.
updateRemoteUserUID 🏷️	boolean	On Linux, if containerUser or remoteUser is specified, the user’s UID/GID will be updated to match the local user’s UID/GID to avoid permission problems with bind mounts. Defaults to true.
userEnvProbe 🏷️	enum	Indicates the type of shell to use to “probe” for user environment variables to include in devcontainer.json supporting services’ / tools’ processes: none, interactiveShell, loginShell, or loginInteractiveShell (default). The specific shell used is based on the default shell for the user (typically bash). For example, bash interactive shells will typically include variables set in /etc/bash.bashrc and ~/.bashrc while login shells usually include variables from /etc/profile and ~/.profile. Setting this property to loginInteractiveShell will get variables from all four files.
overrideCommand 🏷️	boolean	Tells devcontainer.json supporting services / tools whether they should run /bin/sh -c "while sleep 1000; do :; done" when starting the container instead of the container’s default command (since the container can shut down if the default command fails). Set to false if the default command must run for the container to function properly. Defaults to true for when using an image Dockerfile and false when referencing a Docker Compose file.
shutdownAction 🏷️	enum	Indicates whether devcontainer.json supporting tools should stop the containers when the related tool window is closed / shut down.
Values are none, stopContainer (default for image or Dockerfile), and stopCompose (default for Docker Compose).
init 🏷️	boolean	Defaults to false. Cross-orchestrator way to indicate whether the tini init process should be used to help deal with zombie processes.
privileged 🏷️	boolean	Defaults to false. Cross-orchestrator way to cause the container to run in privileged mode (--privileged). Required for things like Docker-in-Docker, but has security implications particularly when running directly on Linux.
capAdd 🏷️	array	Defaults to []. Cross-orchestrator way to add capabilities typically disabled for a container. Most often used to add the ptrace capability required to debug languages like C++, Go, and Rust. For example:
"capAdd": ["SYS_PTRACE"]
securityOpt 🏷️	array	Defaults to []. Cross-orchestrator way to set container security options. For example:
"securityOpt": [ "seccomp=unconfined" ]
mounts 🏷️	string or object	Defaults to unset. Cross-orchestrator way to add additional mounts to a container. Each value is a string that accepts the same values as the Docker CLI --mount flag. Environment and pre-defined variables may be referenced in the value. For example:
"mounts": [{ "source": "dind-var-lib-docker", "target": "/var/lib/docker", "type": "volume" }]
features	object	An object of Dev Container Feature IDs and related options to be added into your primary container. The specific options that are available varies by feature, so see its documentation for additional details. For example:
"features": { "ghcr.io/devcontainers/features/github-cli": {} }
overrideFeatureInstallOrder	array	By default, Features will attempt to automatically set the order they are installed based on a installsAfter property within each of them. This property allows you to override the Feature install order when needed. For example:
"overrideFeatureInstallОrder": [ "ghcr.io/devcontainers/features/common-utils", "ghcr.io/devcontainers/features/github-cli" ]
customizations 🏷️	object	Product specific properties, defined in supporting tools
Scenario specific properties
The focus of devcontainer.json is to describe how to enrich a container for the purposes of development rather than acting as a multi-container orchestrator format. Instead, container orchestrator formats can be referenced when needed to manage multiple containers and their lifecycles. Today, devcontainer.json includes scenario specific properties for working without a container orchestrator (by directly referencing an image or Dockerfile) and for using Docker Compose as a simple multi-container orchestrator.

Image or Dockerfile specific properties
Property	Type	Description
image	string	Required when using an image. The name of an image in a container registry (DockerHub, GitHub Container Registry, Azure Container Registry) that devcontainer.json supporting services / tools should use to create the dev container.
build.dockerfile	string	Required when using a Dockerfile. The location of a Dockerfile that defines the contents of the container. The path is relative to the devcontainer.json file.
build.context	string	Path that the Docker build should be run from relative to devcontainer.json. For example, a value of ".." would allow you to reference content in sibling directories. Defaults to ".".
build.args	Object	A set of name-value pairs containing Docker image build arguments that should be passed when building a Dockerfile. Environment and pre-defined variables may be referenced in the values. Defaults to not set. For example: "build": { "args": { "MYARG": "MYVALUE", "MYARGFROMENVVAR": "${localEnv:VARIABLE_NAME}" } }
build.options	array	An array of Docker image build options that should be passed to the build command when building a Dockerfile. Defaults to []. For example: "build": { "options": [ "--add-host=host.docker.internal:host-gateway" ] }
build.target	string	A string that specifies a Docker image build target that should be passed when building a Dockerfile. Defaults to not set. For example: "build": { "target": "development" }
build.cacheFrom	string,
array	A string or array of strings that specify one or more images to use as caches when building the image. Cached image identifiers are passed to the docker build command with --cache-from.
appPort	integer,
string,
array	In most cases, we recommend using the new forwardPorts property. This property accepts a port or array of ports that should be published locally when the container is running. Unlike forwardPorts, your application may need to listen on all interfaces (0.0.0.0) not just localhost for it to be available externally. Defaults to [].
Learn more about publishing vs forwarding ports here.
Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array properties.
workspaceMount	string	Requires workspaceFolder be set as well. Overrides the default local mount point for the workspace when the container is created. Supports the same values as the Docker CLI --mount flag. Environment and pre-defined variables may be referenced in the value. For example:
"workspaceMount": "source=${localWorkspaceFolder}/sub-folder,target=/workspace,type=bind,consistency=cached", "workspaceFolder": "/workspace"
workspaceFolder	string	Requires workspaceMount be set. Sets the default path that devcontainer.json supporting services / tools should open when connecting to the container. Defaults to the automatic source code mount location.
runArgs	array	An array of Docker CLI arguments that should be used when running the container. Defaults to []. For example, this allows ptrace based debuggers like C++ to work in the container:
"runArgs": [ "--cap-add=SYS_PTRACE", "--security-opt", "seccomp=unconfined" ] .
Docker Compose specific properties
Property	Type	Description
dockerComposeFile	string,
array	Required when using Docker Compose. Path or an ordered list of paths to Docker Compose files relative to the devcontainer.json file. Using an array is useful when extending your Docker Compose configuration. The order of the array matters since the contents of later files can override values set in previous ones.
The default .env file is picked up from the root of the project, but you can use env_file in your Docker Compose file to specify an alternate location.
Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array properties.
service	string	Required when using Docker Compose. The name of the service devcontainer.json supporting services / tools should connect to once running.
runServices	array	An array of services in your Docker Compose configuration that should be started by devcontainer.json supporting services / tools. These will also be stopped when you disconnect unless "shutdownAction" is "none". Defaults to all services.
workspaceFolder	string	Sets the default path that devcontainer.json supporting services / tools should open when connecting to the container (which is often the path to a volume mount where the source code can be found in the container). Defaults to "/".
Tool-specific properties
While most properties apply to any devcontainer.json supporting tool or service, a few are specific to certain tools. You may explore this in the supporting tools and services document.

Lifecycle scripts
When creating or working with a dev container, you may need different commands to be run at different points in the container’s lifecycle. The table below lists a set of command properties you can use to update what the container’s contents in the order in which they are run (for example, onCreateCommand will run after initializeCommand). Each command property is an string or list of command arguments that should execute from the workspaceFolder.

Property	Type	Description
initializeCommand	string,
array,
object	A command string or list of command arguments to run on the host machine during initialization, including during container creation and on subsequent starts. The command may run more than once during a given session.

⚠️ The command is run wherever the source code is located on the host. For cloud services, this is in the cloud.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
onCreateCommand 🏷️	string,
array,
object	This command is the first of three (along with updateContentCommand and postCreateCommand) that finalizes container setup when a dev container is created. It and subsequent commands execute inside the container immediately after it has started for the first time.

Cloud services can use this command when caching or prebuilding a container. This means that it will not typically have access to user-scoped assets or secrets.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
updateContentCommand 🏷️	string,
array,
object	This command is the second of three that finalizes container setup when a dev container is created. It executes inside the container after onCreateCommand whenever new content is available in the source tree during the creation process.

It will execute at least once, but cloud services will also periodically execute the command to refresh cached or prebuilt containers. Like cloud services using onCreateCommand, it can only take advantage of repository and org scoped secrets or permissions.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
postCreateCommand 🏷️	string,
array,
object	This command is the last of three that finalizes container setup when a dev container is created. It happens after updateContentCommand and once the dev container has been assigned to a user for the first time.

Cloud services can use this command to take advantage of user specific secrets and permissions.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
postStartCommand 🏷️	string,
array,
object	A command to run each time the container is successfully started.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
postAttachCommand 🏷️	string,
array,
object	A command to run each time a tool has successfully attached to the container.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
waitFor 🏷️	enum	An enum that specifies the command any tool should wait for before connecting. Defaults to updateContentCommand. This allows you to use onCreateCommand or updateContentCommand for steps that must happen before devcontainer.json supporting tools connect while still using postCreateCommand for steps that can happen behind the scenes afterwards.
For each command property, if the value is a single string, it will be run in /bin/sh. Use && in a string to execute multiple commands. For example, "yarn install" or "apt-get update && apt-get install -y curl". The array syntax ["yarn", "install"] will invoke the command (in this case yarn) directly without using a shell. Each fires after your source code has been mounted, so you can also run shell scripts from your source tree. For example: bash scripts/install-dev-tools.sh.

If one of the lifecycle scripts fails, any subsequent scripts will not be executed. For instance, if postCreateCommand fails, postStartCommand and any following scripts will be skipped.

Minimum host requirements
While devcontainer.json does not focus on hardware or VM provisioning, it can be useful to know your container’s minimum RAM, CPU, and storage requirements. This is what the hostRequirements properties allow you to do. Cloud services can use these properties to automatically default to the best compute option available, while in other cases, you will be presented with a warning if the requirements are not met.

Property	Type	Description
hostRequirements.cpus 🏷️	integer	Indicates the minimum required number of CPUs / virtual CPUs / cores. For example: "hostRequirements": {"cpus": 2}
hostRequirements.memory 🏷️	string	A string indicating minimum memory requirements with a tb, gb, mb, or kb suffix. For example, "hostRequirements": {"memory": "4gb"}
hostRequirements.storage 🏷️	string	A string indicating minimum storage requirements with a tb, gb, mb, or kb suffix. For example, "hostRequirements": {"storage": "32gb"}
hostRequirements.gpu 🏷️	boolean,
string,
object	Indicates if any GPU is required. A boolean indicates if a GPU is required or not. The string "optional" indicates that a GPU is used when available, but is not required.

The object syntax specifies how much GPU resources are required. The cores property indicates the minimum number of cores and the memory property indicates minimum storage requirements with a tb, gb, mb, or kb suffix. For example, "gpu": { "cores": 1000, "storage": "32gb" }
Port attributes
The portsAttributes and otherPortsAttributes properties allow you to map default port options for one or more manually or automatically forwarded ports. The following is a list of options that can be set in the configuration object assigned to the property.

Property	Type	Description
label 🏷️	string	Display name for the port in the ports view. Defaults to not set.
protocol 🏷️	enum	Controls protocol handling for forwarded ports. When not set, the port is assumed to be a raw TCP stream which, if forwarded to localhost, supports any number of protocols. However, if the port is forwarded to a web URL (e.g. from a cloud service on the web), only HTTP ports in the container are supported. Setting this property to https alters handling by ignoring any SSL/TLS certificates present when communicating on the port and using the correct certificate for the forwarded URL instead (e.g https://*.githubpreview.dev). If set to http, processing is the same as if the protocol is not set. Defaults to not set.
onAutoForward 🏷️	enum	Controls what should happen when a port is auto-forwarded once you’ve connected to the container. notify is the default, and a notification will appear when the port is auto-forwarded. If set to openBrowser, the port will be opened in the system’s default browser. A value of openBrowserOnce will open the browser only once. openPreview will open the URL in devcontainer.json supporting services’ / tools’ embedded preview browser. A value of silent will forward the port, but take no further action. A value of ignore means that this port should not be auto-forwarded at all.
requireLocalPort 🏷️	boolean	Dictates when port forwarding is required to map the port in the container to the same port locally or not. If set to false, the devcontainer.json supporting services / tools will attempt to use the specified port forward to localhost, and silently map to a different one if it is unavailable. If set to true, you will be notified if it is not possible to use the same port. Defaults to false.
elevateIfNeeded 🏷️	boolean	Forwarding low ports like 22, 80, or 443 to localhost on the same port from devcontainer.json supporting services / tools may require elevated permissions on certain operating systems. Setting this property to true will automatically try to elevate the devcontainer.json supporting tool’s permissions in this situation. Defaults to false.
Formatting string vs. array properties
The format of certain properties will vary depending on the involvement of a shell.

postCreateCommand, postStartCommand, postAttachCommand, and initializeCommand all have 3 types:

Array: Passed to the OS for execution without going through a shell
String: Goes through a shell (it needs to be parsed into command and arguments)
Object: All lifecycle scripts have been extended to support object types to allow for parallel execution
runArgs only has the array type. Using runArgs via a typical command line, you’ll need single quotes if the shell runs into parameters with spaces. However, these single quotes aren’t passed on to the executable. Thus, in your devcontainer.json, you’d follow the array format and leave out the single quotes:

"runArgs": ["--device-cgroup-rule=my rule here"]
Rather than:

"runArgs": ["--device-cgroup-rule='my rule here'"]
We can compare the string, array, and object versions of postAttachCommand as well. You can use the following string format, which will remove the single quotes as part of the shell’s parsing:

"postAttachCommand": "echo foo='bar'"
By contrast, the array format will keep the single quotes and write them to standard out (you can see the output in the dev container log):

"postAttachCommand": ["echo", "foo='bar'"]
Finally, you may use an object format:

{
  "postAttachCommand": {
    "server": "npm start",
    "db": ["mysql", "-u", "root", "-p", "my database"]
  }
}
Variables in devcontainer.json
Variables can be referenced in certain string values in devcontainer.json in the following format: ${variableName}. The following is a list of available variables you can use.

Variable	Properties	Description
${localEnv:VARIABLE_NAME}	Any	Value of an environment variable on the host machine (in the examples below, called VARIABLE_NAME). Unset variables are left blank.

⚠️ Clients (like VS Code) may need to be restarted to pick up newly set variables.

⚠️ For a cloud service, the host is in the cloud rather than your local machine.

Examples

1. Set a variable containing your local home folder on Linux / macOS or the user folder on Windows:
"remoteEnv": { "LOCAL_USER_PATH": "${localEnv:HOME}${localEnv:USERPROFILE}" }.

A default value for when the environment variable is not set can be given with ${localEnv:VARIABLE_NAME:default_value}.

2. In modern versions of macOS, default configurations allow setting local variables with the command echo 'export VARIABLE_NAME=my-value' >> ~/.zshenv.
${containerEnv:VARIABLE_NAME}	remoteEnv	Value of an existing environment variable inside the container once it is up and running (in this case, called VARIABLE_NAME). For example:
"remoteEnv": { "PATH": "${containerEnv:PATH}:/some/other/path" }

A default value for when the environment variable is not set can be given with ${containerEnv:VARIABLE_NAME:default_value}.
${localWorkspaceFolder}	Any	Path of the local folder that was opened in the devcontainer.json supporting service / tool (that contains .devcontainer/devcontainer.json).
${containerWorkspaceFolder}	Any	The path that the workspaces files can be found in the container.
${localWorkspaceFolderBasename}	Any	Name of the local folder that was opened in the devcontainer.json supporting service / tool (that contains .devcontainer/devcontainer.json).
${containerWorkspaceFolderBasename}	Any	Name of the folder where the workspace files can be found in the container.
${devcontainerId}	Any	Allow Features to refer to an identifier that is unique to the dev container they are installed into and that is stable across rebuilds.
The properties supporting it in devcontainer.json are: name, runArgs, initializeCommand, onCreateCommand, updateContentCommand, postCreateCommand, postStartCommand, postAttachCommand, workspaceFolder, workspaceMount, mounts, containerEnv, remoteEnv, containerUser, remoteUser, and customizations.
Schema
You can see the dev container schema here.

Publishing vs forwarding ports
Docker has the concept of “publishing” ports when the container is created. Published ports behave very much like ports you make available to your local network. If your application only accepts calls from localhost, it will reject connections from published ports just as your local machine would for network calls. Forwarded ports, on the other hand, actually look like localhost to the application.

remoteUser
A dev container configuration will inherit the remoteUser property from the base image it uses.

Using the images and Templates part of the spec as an example: remoteUser in these images is set to a custom value - you may view an example in the C++ image. The C++ Template will then inherit the custom remoteUser value from its base C++ image.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Development Container Specification
The purpose of the Development Container Specification is to provide a way to enrich containers with the content and metadata necessary to enable development inside them. These container environments should be easy to use, create, and recreate.

A development container is a container in which a user can develop an application. Tools that want to implement this specification should provide a set of features/commands that give more flexibility to users and allow development containers to scale to large development groups.

An environment is defined as a logical instance of one or more development containers, along with any needed side-car containers. An environment is based on one set of metadata that can be managed as a single unit. Users can create multiple environments from the same configuration metadata for different purposes.

Metadata
The Development Container Spec allows one to define a repeatable development environment for a user or team of developers that includes the execution environment the application needs. A development container defines an environment in which you develop your application before you are ready to deploy. While deployment and development containers may resemble one another, you may not want to include tools in a deployment image that you use during development and you may need to use different secrets or other settings.

Furthermore, working inside a development container can require additional metadata to drive tooling or service experiences than you would normally need with a production container. Providing a structured and consistent form for this metadata is a core part of this specification.

A development container is composed of a definition (e.g. contained in a devcontainer.json file) that deterministically creates containers under the control of the user.

devcontainer.json
While the structure of this metadata is critical, it is also important to call out how this data can be represented on disk where appropriate. While other representations may be added over time, metadata can be stored in a JSON with Comments file called devcontainer.json today. Products using it should expect to find a devcontainer.json file in one or more of the following locations (in order of precedence):

.devcontainer/devcontainer.json
.devcontainer.json
.devcontainer/<folder>/devcontainer.json (where <folder> is a sub-folder, one level deep)
It is valid that these files may exist in more than one location, so consider providing a mechanism for users to select one when appropriate.

Image Metadata
Certain dev container metadata properties can be stored in an image label as an array of metadata snippets. This allows them to be stored in prebuilt images, such that, the image and its related configuration are self-contained. These contents should then be merged with any local devcontainer.json file contents at the time the container is created. An array is used so subsequent image builds can simply append changes to the array rather than attempting to merge at that point - which improves compatibility with arbitrary image build systems.

Metadata should be representative of with the following structure, using one entry per Dev Container Feature and devcontainer.json (see table below for the full list):

[
	{
		"id"?: string,
		"init"?: boolean,
		"privileged"?: boolean,
		"capAdd"?: string[],
		"securityOpt"?: string[],
		"entrypoint"?: string,
		"mounts"?: [],
		...
		"customizations"?: {
			...
		}
	},
	...
]
To simplify adding this metadata for other tools, we also support having a single top-level object with the same properties.

The metadata is added to the image as a devcontainer.metadata label with a JSON string value representing the above array or single object.

Merge Logic
To apply the metadata together with a user’s devcontainer.json at runtime, the following merge logic by property is used. The table also notes which properties are currently supported coming from the devcontainer.json and from the Feature metadata- this will change over time as we add more properties.

Property	Type/Format	Merge Logic	devcontainer.json	devcontainer-feature.json
id	E.g., ghcr.io/devcontainers/features/node:1	Not merged.	 	✓
init	boolean	true if at least one is true, false otherwise.	✓	✓
privileged	boolean	true if at least one is true, false otherwise.	✓	✓
capAdd	string[]	Union of all capAdd arrays without duplicates.	✓	✓
securityOpt	string[]	Union of all securityOpt arrays without duplicates.	✓	✓
entrypoint	string	Collected list of all entrypoints.	 	✓
mounts	(string \| { type, src, dst })[]	Collected list of all mountpoints. Conflicts: Last source wins.	✓	✓
onCreateCommand	string \| string[] \| {[key: string]: string \| string[]}	Collected list of all onCreateCommands.	✓	✓
updateContentCommand	string \| string[] \| {[key: string]: string \| string[]}	Collected list of all updateContentCommands.	✓	✓
postCreateCommand	string \| string[] \| {[key: string]: string \| string[]}	Collected list of all postCreateCommands.	✓	✓
postStartCommand	string \| string[] \| {[key: string]: string \| string[]}	Collected list of all postStartCommands.	✓	✓
postAttachCommand	string \| string[] \| {[key: string]: string \| string[]}	Collected list of all postAttachCommands.	✓	✓
waitFor	enum	Last value wins.	✓	 
customizations	Object of tool-specific customizations.	Merging is left to the tools.	✓	✓
containerUser	string	Last value wins.	✓	 
remoteUser	string	Last value wins.	✓	 
userEnvProbe	string (enum)	Last value wins.	✓	 
remoteEnv	Object of strings.	Per variable, last value wins.	✓	 
containerEnv	Object of strings.	Per variable, last value wins.	✓	 
overrideCommand	boolean	Last value wins.	✓	 
portsAttributes	Map of ports to attributes.	Per port (not per port attribute), last value wins.	✓	 
otherPortsAttributes	Port attributes.	Last value wins (not per port attribute).	✓	 
forwardPorts	(number \| string)[]	Union of all ports without duplicates. Last one wins (when mapping changes).	✓	 
shutdownAction	string (enum)	Last value wins.	✓	 
updateRemoteUserUID	boolean	Last value wins.	✓	 
hostRequirements	cpus, memory, storage, gpu	Max value wins.	✓	 
Variables in string values will be substituted at the time the value is applied. When the order matters, the devcontainer.json is considered last.

Notes
Passing the label as a LABEL instruction in the Dockerfile:
The size limit on Dockerfiles is around 1.3MB. The line length is limited to 65k characters.
Using one line per Feature should allow for making full use of these limits.
Passing the label as a command line argument:
There is no size limit documented for labels, but the daemon returns an error when the request header is >500kb.
The 500kb limit is shared, so we cannot use a second label in the same build to avoid it.
If/when this becomes an issue we could embed the metadata as a file in the image (e.g., with a label indicating it).
Orchestration options
A core principle of this specification is to seek to enrich existing container orchestrator formats with development container metadata where appropriate rather than replacing them. As a result, the metadata schema includes a set of optional properties for interoperating with different orchestrators. Today, the specification includes scenario-specific properties for working without a container orchestrator (by directly referencing an image or Dockerfile) and for using Docker Compose as a simple multi-container orchestrator. At the same time, this specification leaves space for further development and implementation of other orchestrator mechanisms and file formats.

The following section describes the differences between those that are supported now.

Image based
Image based configurations only reference an image that should be reachable and downloadable through docker pull commands. Logins and tokens required for these operations are execution environment specific. The only required parameter is image. The details are here.

Dockerfile based
These configurations are defined as using a Dockerfile to define the starting point of the development containers. As with image based configurations, it is assumed that any base images are already reachable by Docker when performing a docker build command. The only required parameter in this case is the relative reference to the Dockerfile in build.dockerfile. The details are here.

There are multiple properties that allow users to control how docker build works:

build.context
build.args
build.target
build.cacheFrom
Docker Compose based
Docker Compose configurations use docker-compose (which may be Docker Compose V1 or aliased Docker Compose V2) to create and manage a set of containers required for an application. As with the other configurations, any images required for this operation are assumed to be reachable. The required parameters are:

dockerComposeFile: the reference to the Docker Compose file(s) to be used.
service: declares the main container that will be used for all other operations. Tools are assumed to also use this parameter to connect to the development container, although they can provide facilities to connect to the other containers as required by the user.
runServices: an optional property that indicates the set of services in the docker-compose configuration that should be started or stopped with the environment.
It is important to note that the image and dockerfile properties are not needed since Docker Compose supports them natively in the format.

Other options
In addition to the configuration options explained above, there are other settings that apply when creating development containers to facilitate their use by developers.

A complete list of available metadata properties and their purposes can be found in the devcontainer.json reference. However, we will describe the critical ones below in more detail.

Features
Development container “Features” are self-contained, shareable units of installation code and development container configuration. The name comes from the idea that referencing one of them allows you to quickly and easily add more tooling, runtime, or library “features” into your development container for you or your collaborators to use.

They are applied to container images as a secondary build step and can affect a number of dev container configuration settings. See the Features documentation for more details.

Environment variables
Environment variables can be set at different points in the dev container lifecycle. With this in mind, development containers support two classes of environment variables:

Container: These variables are part of the container when it is created and are available at all points in its lifecycle. This concept is native to containers and can be set in the container image itself, using containerEnv for image and Dockerfile scenarios or using orchestrator specific properties like env in Docker Compose files.
Remote: These variables should be set by a development container supporting tool as part of configuring its runtime environment. Users can set these using the remoteEnv property and implementing tools or services may add their own for specific scenarios (e.g., secrets). These variables can change during the lifetime of the container, and are added after the container’s ENTRYPOINT has fired.
The reason for this separation is it allows for the use of information not available at image build time and simplifies updating the environment for project/repository specific needs without modifying an image. With this in in mind, it’s important to note that implementing tools should also support the dynamic variable syntax described in the metadata reference document.

Another notable and important environment variable related property is userEnvProbe. Implementing tools should use this property to “probe” for expected environment variables using the specified type of shell. However, it does not specify that this type of shell needs to be used for all sub-processes (given the performance impact). Instead, “probed” environment variables should be merged with remote environment variables for any processes the implementer injects after the container is created. allows implementors to emulate developer expected behaviors around values added to their profile and rc files.

Mounts
Mounts allow containers to have access to the underlying machine, share data between containers and to persist information between development containers.

A default mount should be included so that the source code is accessible from inside the container. Source code is stored outside of the container so that a developer’s in-flight edits can be extracted, or a new container created in the event a container no longer starts.

workspaceFolder and workspaceMount
The default mount point for the source code can be set with the workspaceMount property for image and Dockerfile scenarios or using the built in mounts property in Docker Compose files. This folder should point to the root of a repository (where the .git folder is found) so that source control operations work correctly inside the container.

The workspaceFolder can then be set to the default folder inside the container that should used in the container. Typically this is either the mount point in the container, or a sub-folder under it. Allowing a sub-folder to be used is particularly important for monorepos given you need the .git folder to interact with source control but developers are typically are interacting with a specific sub-project within the overall repository.

See workspaceMount and workspaceFolder for reference.

Users
Users control the permissions of applications executed in the containers, allowing the developer to control them. The specification takes into account two types of user definitions:

Container User: The user that will be used for all operations that run inside a container. This concept is native to containers. It may be set in the container image, using the containerUser property for image and dockerfile scenarios, or using an orchestratric specific property like user property in Docker Compose files.
Remote User: Used to run the lifecycle scripts inside the container. This is also the user tools and editors that connect to the container should use to run their processes. This concept is not native to containers. Set using the remoteEnv property in all cases and defaults to the container user.
This separation allows the ENTRYPOINT for the image to execute with different permissions than the developer and allows for developers to switch users without recreating their containers.

Lifecycle
A development environment goes through different lifecycle events during its use in the outer and inner loop of development.

Configuration Validation
Environment Creation
Environment Stop
Environment Resume
Configuration Validation
The exact steps required to validate configuration can vary based on exactly where the development container metadata is persisted. However, when considering a devcontainer.json file, the following validation should occur:

Validate that a workspace source folder has been provided. It is up to the implementing tool to determine what to do if no source folder is provided.
Search for a devcontainer.json file in one of the locations above in the workspace source folder.
If no devcontainer.json is found, it is up to the implementing tool or service to determine what to do. This specification does not dictate this behavior.
Validate that the metadata (for example devcontainer.json) contains all parameters required for the selected configuration type.
Environment Creation
The creation process goes through the steps necessary to go from the user configuration to a working environment that is ready to be used.

Initialization
During this step, the following is executed:

Validate access to the container orchestrator specified by the configuration.
Execution of initializeCommand.
Image Creation
The first part of environment creation is generating the final image(s) that the development containers are going to use. This step is orchestrator dependent and can consist of just pulling a Docker image, running Docker build, or docker-compose build. Additionally, this step is useful on its own since it permits the creation of intermediate images that can be uploaded and used by other users, thus cutting down on creation time. It is encouraged that tools implementing this specification give access to a command that just executes this step.

This step executes the following tasks:

Configuration Validation
Pull/build/execute of the defined container orchestration format to create images.
Validate the result of these operations.
Container Creation
After image creation, containers are created based on that image and setup.

This step executes the following tasks:

[Optional] Perform any required user UID/GID sync’ing (more next)
Create the container(s) based on the properties specified above.
Validate the container(s) were created successfully.
Note that container mounts, environment variables, and user configuration should be applied at this point. However, remote user and environment variable configuration should not be.

UID/GID sync’ing is an optional task for Linux (only) and that executes if the updateRemoteUserUID property is set to true and a containerUser or remoteUser is specified. In this case, an image update should be made prior to creating the container to set the specified user’s UID and GID to match the current local user’s UID/GID to avoid permission problems with bind mounts. Implementations may skip this task if they do not use bind mounts on Linux, or use a container engine that does this translation automatically.

Post Container Creation
At the end of the container creation step, a set of commands are executed inside the main container:

onCreateCommand, updateContentCommand and postCreateCommand. This set of commands is executed in sequence on a container the first time it’s created and depending on the creation parameters received. You can learn more in the documentation on lifecycle scripts. By default, postCreateCommand is executed in the background after reporting the successful creation of the development environment.
If the waitFor property is defined, then execution should block until all commands in the sequence up to the specified property have executed. This property defaults to updateContentCommand.
Remote environment variables and user configuration should be applied to all created processes in the container (inclusive of userEnvProbe).

Implementation specific steps
After these steps have been executed, any implementation specific commands can safely execute. Specifically, any processes required by the implementation to support other properties in this specification should be started at this point. These may occur in parallel to any non-blocking, background post-container creation commands (as dictated by the waitFor property).

Any user facing processes should have remote environment variables and user configuration applied (inclusive of userEnvProbe).

For example, in the CLI reference implementation, this is the point in which anything executed with devcontainer exec would run.

Typically, this is also the step where implementors would apply config or settings from the customizations section of the dev container metadata (e.g., VS Code installs extensions based on the customizations.vscode.extensions property). Examples of these can be found in the supporting tools section reference. However, applying these at this point is not strictly required or mandated by this specification.

Once these final steps have occurred, implementing tools or services may connect to the environment as they see fit.

Environment Stop
The intention of this step is to ensure all containers are stopped correctly based on the appropriate orchestrator specific steps to ensure no data is lost. It is up to the implementing tool or service to determine when this event should happen.

Environment Resume
While it is not a strict requirement to keep a development container after it has been stopped, this is the most common scenario.

To resume the environment from a stopped state:

Restart all related containers.
Follow the appropriate implementation specific steps.
Additionally, execute the postStartCommand and postAttachCommand in the container.
Like during the create process, remote environment variables and user configuration should be applied to all created processes in the container (inclusive of userEnvProbe).

Parallel lifecycle script execution
Dev containers support a single command for each of its lifecycle scripts. While serial execution of multiple commands can be achieved with ;, &&, etc., parallel execution deserves first-class support.

All lifecycle scripts have been extended to support object types. The key of the object will be a unique name for the command, and the value will be the string or array command. Each command must exit successfully for the stage to be considered successful.

Each entry in the object will be run in parallel during that lifecycle step.

Example
{
  "postCreateCommand": {
    "server": "npm start",
    "db": ["mysql", "-u", "root", "-p", "my database"]
  }
}
Definitions
Project Workspace Folder
The project workspace folder is where an implementing tool should begin to search for devcontainer.json files. If the target project on disk is using git, the project workspace folder is typically the root of the git repository.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Reference Implementation
The reference implementation for the specification is available through a development container CLI. This CLI can take a devcontainer.json and create and configure a dev container from it.

What is the Dev Container CLI?
When tools like VS Code and Codespaces detect a devcontainer.json file in a user’s project, they use a CLI to configure a dev container. We’ve now opened up this CLI as a reference implementation so that individual users and other tools can read in devcontainer.json metadata and create dev containers from it.

This CLI can either be used directly or integrated into product experiences, similar to how it’s integrated with Dev Containers and Codespaces today. It currently supports both a simple single container option and integrates with Docker Compose for multi-container scenarios.

The CLI is available in the devcontainers/cli repository.

How can I try it?
We’d love for you to try out the Dev Container CLI and let us know what you think. You can quickly try it out in just a few simple steps, either by installing its npm package or building the CLI repo from sources.

You may learn more about building from sources in the CLI repo’s README. On this page, we’ll focus on using the npm package.

To install the npm package, you will need Python, Node.js (version 14 or greater), and C/C++ installed to build one of the dependencies. The VS Code How to Contribute wiki has details about the recommended toolsets.

npm install
npm install -g @devcontainers/cli
Verify you can run the CLI and see its help text:

devcontainer <command>

Commands:
  devcontainer up                   Create and run dev container
  devcontainer build [path]         Build a dev container image
  devcontainer run-user-commands    Run user commands
  devcontainer read-configuration   Read configuration
  devcontainer features             Features commands
  devcontainer templates            Templates commands
  devcontainer exec <cmd> [args..]  Execute a command on a running dev container

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
Try out the CLI
Once you have the CLI, you can try it out with a sample project, like this Rust sample.

Clone the Rust sample to your machine, and start a dev container with the CLI’s up command:

git clone https://github.com/microsoft/vscode-remote-try-rust
devcontainer up --workspace-folder <path-to-vscode-remote-try-rust>
This will download the container image from a container registry and start the container. Your Rust container should now be running:

[88 ms] dev-containers-cli 0.1.0.
[165 ms] Start: Run: docker build -f /home/node/vscode-remote-try-rust/.devcontainer/Dockerfile -t vsc-vscode-remote-try-rust-89420ad7399ba74f55921e49cc3ecfd2 --build-arg VARIANT=bullseye /home/node/vscode-remote-try-rust/.devcontainer
[+] Building 0.5s (5/5) FINISHED
 => [internal] load build definition from Dockerfile                       0.0s
 => => transferring dockerfile: 38B                                        0.0s
 => [internal] load .dockerignore                                          0.0s
 => => transferring context: 2B                                            0.0s
 => [internal] load metadata for mcr.microsoft.com/vscode/devcontainers/r  0.4s
 => CACHED [1/1] FROM mcr.microsoft.com/vscode/devcontainers/rust:1-bulls  0.0s
 => exporting to image                                                     0.0s
 => => exporting layers                                                    0.0s
 => => writing image sha256:39873ccb81e6fb613975e11e37438eee1d49c963a436d  0.0s
 => => naming to docker.io/library/vsc-vscode-remote-try-rust-89420ad7399  0.0s
[1640 ms] Start: Run: docker run --sig-proxy=false -a STDOUT -a STDERR --mount type=bind,source=/home/node/vscode-remote-try-rust,target=/workspaces/vscode-remote-try-rust -l devcontainer.local_folder=/home/node/vscode-remote-try-rust --cap-add=SYS_PTRACE --security-opt seccomp=unconfined --entrypoint /bin/sh vsc-vscode-remote-try-rust-89420ad7399ba74f55921e49cc3ecfd2-uid -c echo Container started
Container started
{"outcome":"success","containerId":"f0a055ff056c1c1bb99cc09930efbf3a0437c54d9b4644695aa23c1d57b4bd11","remoteUser":"vscode","remoteWorkspaceFolder":"/workspaces/vscode-remote-try-rust"}
You can then run commands in this dev container:

devcontainer exec --workspace-folder <path-to-vscode-remote-try-rust> cargo run
This will compile and run the Rust sample, outputting:

[33 ms] dev-containers-cli 0.1.0.
   Compiling hello_remote_world v0.1.0 (/workspaces/vscode-remote-try-rust)
    Finished dev [unoptimized + debuginfo] target(s) in 1.06s
     Running `target/debug/hello_remote_world`
Hello, VS Code Remote - Containers!
{"outcome":"success"}
Congrats, you’ve just run the Dev Container CLI and seen it in action!

These steps are also provided in the CLI repo’s README. You may also review frequently asked questions here.

Prebuilding
We recommend pre-building images with the tools you need rather than creating and building a container image each time you open your project in a dev container. Using pre-built images will result in a faster container startup, simpler configuration, and allows you to pin to a specific version of tools to improve supply-chain security and avoid potential breaks. You can automate pre-building your image by scheduling the build using a DevOps or continuous integration (CI) service like GitHub Actions.

We recommend using the Dev Container CLI (or other spec supporting utilities like the GitHub Action or Azure DevOps task) to pre-build your images. Once you’ve built your image, you can push it to a container registry (like the Azure Container Registry, GitHub Container Registry, or Docker Hub) and reference it directly.

devcontainer build --workspace-folder . --push true --image-name <my_image_name>:<optional_image_version>
You can also check out our in-depth guide on prebuilds.

Metadata in image labels
You can include Dev Container configuration and Feature metadata in prebuilt images via image labels. This makes the image self-contained since these settings are automatically picked up when the image is referenced - whether directly, in a FROM in a referenced Dockerfile, or in a Docker Compose file. This helps prevent your Dev Container config and image contents from getting out of sync, and allows you to push updates of the same configuration to multiple repositories through a simple image reference.

This metadata label is automatically added when you pre-build using the Dev Container CLI (or other spec supporting utilities like the GitHub Action or Azure DevOps task) and includes settings from devcontainer.json and any referenced Dev Container Features.

This allows you to have a separate more complex devcontainer.json you use to pre-build your image, and then a dramatically simplified one in one or more repositories. The contents of the image will be merged with this simplified devcontainer.json content at the time you create the container (see the the spec for info on merge logic). But at its simplest, you can just reference the image directly in devcontainer.json for the settings to take effect:

{
    "image": "mcr.microsoft.com/devcontainers/go:1"
}
Note that you can also opt to manually add metadata to an image label instead. These properties will be picked up even if you didn’t use the Dev Container CLI to build (and can be updated by the CLI even if you do). For example, consider this Dockerfile snippet:

LABEL devcontainer.metadata='[{ \
  "capAdd": [ "SYS_PTRACE" ], \
  "remoteUser": "devcontainer", \ 
  "postCreateCommand": "yarn install" \ 
}]'
See the Dev Container metadata reference for information on which properties are supported.

Domain Names
If you are behind a firewall that needs to allow specific domains used by the Dev Container CLI, here’s the list of hostnames you should allow communication to go through:

containers.dev - The homepage for everything about dev containers. It includes all official and community-supported Features and Templates.
ghcr.io, *.azurecr.io, mcr.microsoft.com - OCI registries like GitHub Container Registry, Azure Container Registry, and Microsoft Container Registry serves as the primary distribution mechanism for dev container resources.
 
Manage cookies 
Microsoft
© 2025 Microsoft



Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
devcontainer.json schema
You may review the current devcontainer.json schemas in the spec repo, which include:

The base schema: schema describing all base properties as documented in the devcontainer.json reference.
The main schema: references the base schema, plus all schemas containing tool-specific properties.
Base Schema
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"description": "Defines a dev container",
	"allowComments": true,
	"allowTrailingCommas": false,
	"definitions": {
		"devContainerCommon": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"description": "A name for the dev container which can be displayed to the user."
				},
				"features": {
					"type": "object",
					"description": "Features to add to the dev container.",
					"additionalProperties": true
				},
				"overrideFeatureInstallOrder": {
					"type": "array",
					"description": "Array consisting of the Feature id (without the semantic version) of Features in the order the user wants them to be installed.",
					"items": {
						"type": "string"
					}
				},
				"forwardPorts": {
					"type": "array",
					"description": "Ports that are forwarded from the container to the local machine. Can be an integer port number, or a string of the format \"host:port_number\".",
					"items": {
						"oneOf": [
							{
								"type": "integer",
								"maximum": 65535,
								"minimum": 0
							},
							{
								"type": "string",
								"pattern": "^([a-z0-9-]+):(\\d{1,5})$"
							}
						]
					}
				},
				"portsAttributes": {
					"type": "object",
					"patternProperties": {
						"(^\\d+(-\\d+)?$)|(.+)": {
							"type": "object",
							"description": "A port, range of ports (ex. \"40000-55000\"), or regular expression (ex. \".+\\\\/server.js\").  For a port number or range, the attributes will apply to that port number or range of port numbers. Attributes which use a regular expression will apply to ports whose associated process command line matches the expression.",
							"properties": {
								"onAutoForward": {
									"type": "string",
									"enum": [
										"notify",
										"openBrowser",
										"openBrowserOnce",
										"openPreview",
										"silent",
										"ignore"
									],
									"enumDescriptions": [
										"Shows a notification when a port is automatically forwarded.",
										"Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser.",
										"Opens the browser when the port is automatically forwarded, but only the first time the port is forward during a session. Depending on your settings, this could open an embedded browser.",
										"Opens a preview in the same window when the port is automatically forwarded.",
										"Shows no notification and takes no action when this port is automatically forwarded.",
										"This port will not be automatically forwarded."
									],
									"description": "Defines the action that occurs when the port is discovered for automatic forwarding",
									"default": "notify"
								},
								"elevateIfNeeded": {
									"type": "boolean",
									"description": "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port.",
									"default": false
								},
								"label": {
									"type": "string",
									"description": "Label that will be shown in the UI for this port.",
									"default": "Application"
								},
								"requireLocalPort": {
									"type": "boolean",
									"markdownDescription": "When true, a modal dialog will show if the chosen local port isn't used for forwarding.",
									"default": false
								},
								"protocol": {
									"type": "string",
									"enum": [
										"http",
										"https"
									],
									"description": "The protocol to use when forwarding this port."
								}
							},
							"default": {
								"label": "Application",
								"onAutoForward": "notify"
							}
						}
					},
					"markdownDescription": "Set default properties that are applied when a specific port number is forwarded. For example:\n\n```\n\"3000\": {\n  \"label\": \"Application\"\n},\n\"40000-55000\": {\n  \"onAutoForward\": \"ignore\"\n},\n\".+\\\\/server.js\": {\n \"onAutoForward\": \"openPreview\"\n}\n```",
					"defaultSnippets": [
						{
							"body": {
								"${1:3000}": {
									"label": "${2:Application}",
									"onAutoForward": "notify"
								}
							}
						}
					],
					"additionalProperties": false
				},
				"otherPortsAttributes": {
					"type": "object",
					"properties": {
						"onAutoForward": {
							"type": "string",
							"enum": [
								"notify",
								"openBrowser",
								"openPreview",
								"silent",
								"ignore"
							],
							"enumDescriptions": [
								"Shows a notification when a port is automatically forwarded.",
								"Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser.",
								"Opens a preview in the same window when the port is automatically forwarded.",
								"Shows no notification and takes no action when this port is automatically forwarded.",
								"This port will not be automatically forwarded."
							],
							"description": "Defines the action that occurs when the port is discovered for automatic forwarding",
							"default": "notify"
						},
						"elevateIfNeeded": {
							"type": "boolean",
							"description": "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port.",
							"default": false
						},
						"label": {
							"type": "string",
							"description": "Label that will be shown in the UI for this port.",
							"default": "Application"
						},
						"requireLocalPort": {
							"type": "boolean",
							"markdownDescription": "When true, a modal dialog will show if the chosen local port isn't used for forwarding.",
							"default": false
						},
						"protocol": {
							"type": "string",
							"enum": [
								"http",
								"https"
							],
							"description": "The protocol to use when forwarding this port."
						}
					},
					"defaultSnippets": [
						{
							"body": {
								"onAutoForward": "ignore"
							}
						}
					],
					"markdownDescription": "Set default properties that are applied to all ports that don't get properties from the setting `remote.portsAttributes`. For example:\n\n```\n{\n  \"onAutoForward\": \"ignore\"\n}\n```",
					"additionalProperties": false
				},
				"updateRemoteUserUID": {
					"type": "boolean",
					"description": "Controls whether on Linux the container's user should be updated with the local user's UID and GID. On by default when opening from a local folder."
				},
				"remoteEnv": {
					"type": "object",
					"additionalProperties": {
						"type": [
							"string",
							"null"
						]
					},
					"description": "Remote environment variables to set for processes spawned in the container including lifecycle scripts and any remote editor/IDE server process."
				},
				"remoteUser": {
					"type": "string",
					"description": "The username to use for spawning processes in the container including lifecycle scripts and any remote editor/IDE server process. The default is the same user as the container."
				},
				"initializeCommand": {
					"type": [
						"string",
						"array"
					],
					"description": "A command string or list of command arguments to run on the host machine during initialization, including during container creation and on subsequent starts.  The command may run more than once during a given session. This command is run before \"onCreateCommand\". If this is a single string, it will be run in a shell. If this is an array of strings, it will be run as a single command without shell.",

					"items": {
						"type": "string"
					}
				},
				"onCreateCommand": {
					"type": [
						"string",
						"array",
						"object"
					],
					"description": "A command to run when creating the container. This command is run after \"initializeCommand\" and before \"updateContentCommand\". If this is a single string, it will be run in a shell. If this is an array of strings, it will be run as a single command without shell.",
					"items": {
						"type": "string"
					},
					"additionalProperties": {
						"type": [
							"string",
							"array"
						],
						"items": {
							"type": "string"
						}
					}
				},
				"updateContentCommand": {
					"type": [
						"string",
						"array",
						"object"
					],
					"description": "A command to run when creating the container and rerun when the workspace content was updated while creating the container. This command is run after \"onCreateCommand\" and before \"postCreateCommand\". If this is a single string, it will be run in a shell. If this is an array of strings, it will be run as a single command without shell.",
					"items": {
						"type": "string"
					},
					"additionalProperties": {
						"type": [
							"string",
							"array"
						],
						"items": {
							"type": "string"
						}
					}
				},
				"postCreateCommand": {
					"type": [
						"string",
						"array",
						"object"
					],
					"description": "A command to run after creating the container. This command is run after \"updateContentCommand\" and before \"postStartCommand\". If this is a single string, it will be run in a shell. If this is an array of strings, it will be run as a single command without shell.",
					"items": {
						"type": "string"
					},
					"additionalProperties": {
						"type": [
							"string",
							"array"
						],
						"items": {
							"type": "string"
						}
					}
				},
				"postStartCommand": {
					"type": [
						"string",
						"array",
						"object"
					],
					"description": "A command to run after starting the container. This command is run after \"postCreateCommand\" and before \"postAttachCommand\". If this is a single string, it will be run in a shell. If this is an array of strings, it will be run as a single command without shell.",
					"items": {
						"type": "string"
					},
					"additionalProperties": {
						"type": [
							"string",
							"array"
						],
						"items": {
							"type": "string"
						}
					}
				},
				"postAttachCommand": {
					"type": [
						"string",
						"array",
						"object"
					],
					"description": "A command to run when attaching to the container. This command is run after \"postStartCommand\". If this is a single string, it will be run in a shell. If this is an array of strings, it will be run as a single command without shell.",
					"items": {
						"type": "string"
					},
					"additionalProperties": {
						"type": [
							"string",
							"array"
						],
						"items": {
							"type": "string"
						}
					}
				},
				"waitFor": {
					"type": "string",
					"enum": [
						"initializeCommand",
						"onCreateCommand",
						"updateContentCommand",
						"postCreateCommand",
						"postStartCommand"
					],
					"description": "The user command to wait for before continuing execution in the background while the UI is starting up. The default is \"updateContentCommand\"."
				},
				"userEnvProbe": {
					"type": "string",
					"enum": [
						"none",
						"loginShell",
						"loginInteractiveShell",
						"interactiveShell"
					],
					"description": "User environment probe to run. The default is \"loginInteractiveShell\"."
				},
				"hostRequirements": {
					"type": "object",
					"description": "Host hardware requirements.",
					"allOf": [
						{
							"type": "object",
							"properties": {
								"cpus": {
									"type": "integer",
									"minimum": 1,
									"description": "Number of required CPUs."
								},
								"memory": {
									"type": "string",
									"pattern": "^\\d+([tgmk]b)?$",
									"description": "Amount of required RAM in bytes. Supports units tb, gb, mb and kb."
								},
								"storage": {
									"type": "string",
									"pattern": "^\\d+([tgmk]b)?$",
									"description": "Amount of required disk space in bytes. Supports units tb, gb, mb and kb."
								},
								"gpu": {
									"oneOf": [
										{
											"type": [
												"boolean",
												"string"
											],
											"enum": [
												true,
												false,
												"optional"
											],
											"description": "Indicates whether a GPU is required. The string \"optional\" indicates that a GPU is optional. An object value can be used to configure more detailed requirements."
										},
										{
											"type": "object",
											"properties": {
												"cores": {
													"type": "integer",
													"minimum": 1,
													"description": "Number of required cores."
												},
												"memory": {
													"type": "string",
													"pattern": "^\\d+([tgmk]b)?$",
													"description": "Amount of required RAM in bytes. Supports units tb, gb, mb and kb."
												}
											},
											"description": "Indicates whether a GPU is required. The string \"optional\" indicates that a GPU is optional. An object value can be used to configure more detailed requirements.",
											"additionalProperties": false
										}
									]
								}
							}
						}
					]
				},
				"customizations": {
					"type": "object",
					"description": "Tool-specific configuration. Each tool should use a JSON object subproperty with a unique name to group its customizations."
				},
				"additionalProperties": {
					"type": "object",
					"additionalProperties": true
				}
			}
		},
		"nonComposeBase": {
			"type": "object",
			"properties": {
				"appPort": {
					"type": [
						"integer",
						"string",
						"array"
					],
					"description": "Application ports that are exposed by the container. This can be a single port or an array of ports. Each port can be a number or a string. A number is mapped to the same port on the host. A string is passed to Docker unchanged and can be used to map ports differently, e.g. \"8000:8010\".",
					"items": {
						"type": [
							"integer",
							"string"
						]
					}
				},
				"containerEnv": {
					"type": "object",
					"additionalProperties": {
						"type": "string"
					},
					"description": "Container environment variables."
				},
				"containerUser": {
					"type": "string",
					"description": "The user the container will be started with. The default is the user on the Docker image."
				},
				"mounts": {
					"type": "array",
					"description": "Mount points to set up when creating the container. See Docker's documentation for the --mount option for the supported syntax.",
					"items": {
						"type": "string"
					}
				},
				"runArgs": {
					"type": "array",
					"description": "The arguments required when starting in the container.",
					"items": {
						"type": "string"
					}
				},
				"shutdownAction": {
					"type": "string",
					"enum": [
						"none",
						"stopContainer"
					],
					"description": "Action to take when the user disconnects from the container in their editor. The default is to stop the container."
				},
				"overrideCommand": {
					"type": "boolean",
					"description": "Whether to overwrite the command specified in the image. The default is true."
				},
				"workspaceFolder": {
					"type": "string",
					"description": "The path of the workspace folder inside the container."
				},
				"workspaceMount": {
					"type": "string",
					"description": "The --mount parameter for docker run. The default is to mount the project folder at /workspaces/$project."
				}
			}
		},
		"dockerfileContainer": {
			"oneOf": [
				{
					"type": "object",
					"properties": {
						"build": {
							"type": "object",
							"description": "Docker build-related options.",
							"allOf": [
								{
									"type": "object",
									"properties": {
										"dockerfile": {
											"type": "string",
											"description": "The location of the Dockerfile that defines the contents of the container. The path is relative to the folder containing the `devcontainer.json` file."
										},
										"context": {
											"type": "string",
											"description": "The location of the context folder for building the Docker image. The path is relative to the folder containing the `devcontainer.json` file."
										}
									},
									"required": [
										"dockerfile"
									]
								},
								{
									"$ref": "#/definitions/buildOptions"
								}
							]
						}
					},
					"required": [
						"build"
					]
				},
				{
					"allOf": [
						{
							"type": "object",
							"properties": {
								"dockerFile": {
									"type": "string",
									"description": "The location of the Dockerfile that defines the contents of the container. The path is relative to the folder containing the `devcontainer.json` file."
								},
								"context": {
									"type": "string",
									"description": "The location of the context folder for building the Docker image. The path is relative to the folder containing the `devcontainer.json` file."
								}
							},
							"required": [
								"dockerFile"
							]
						},
						{
							"type": "object",
							"properties": {
								"build": {
									"description": "Docker build-related options.",
									"$ref": "#/definitions/buildOptions"
								}
							}
						}
					]
				}
			]
		},
		"buildOptions": {
			"type": "object",
			"properties": {
				"target": {
					"type": "string",
					"description": "Target stage in a multi-stage build."
				},
				"args": {
					"type": "object",
					"additionalProperties": {
						"type": [
							"string"
						]
					},
					"description": "Build arguments."
				},
				"cacheFrom": {
					"type": [
						"string",
						"array"
					],
					"description": "The image to consider as a cache. Use an array to specify multiple images.",
					"items": {
						"type": "string"
					}
				}
			}
		},
		"imageContainer": {
			"type": "object",
			"properties": {
				"image": {
					"type": "string",
					"description": "The docker image that will be used to create the container."
				}
			},
			"required": [
				"image"
			]
		},
		"composeContainer": {
			"type": "object",
			"properties": {
				"dockerComposeFile": {
					"type": [
						"string",
						"array"
					],
					"description": "The name of the docker-compose file(s) used to start the services.",
					"items": {
						"type": "string"
					}
				},
				"service": {
					"type": "string",
					"description": "The service you want to work on. This is considered the primary container for your dev environment which your editor will connect to."
				},
				"runServices": {
					"type": "array",
					"description": "An array of services that should be started and stopped.",
					"items": {
						"type": "string"
					}
				},
				"workspaceFolder": {
					"type": "string",
					"description": "The path of the workspace folder inside the container. This is typically the target path of a volume mount in the docker-compose.yml."
				},
				"shutdownAction": {
					"type": "string",
					"enum": [
						"none",
						"stopCompose"
					],
					"description": "Action to take when the user disconnects from the primary container in their editor. The default is to stop all of the compose containers."
				},
				"overrideCommand": {
					"type": "boolean",
					"description": "Whether to overwrite the command specified in the image. The default is false."
				}
			},
			"required": [
				"dockerComposeFile",
				"service",
				"workspaceFolder"
			]
		}
	},
	"oneOf": [
		{
			"allOf": [
				{
					"oneOf": [
						{
							"allOf": [
								{
									"oneOf": [
										{
											"$ref": "#/definitions/dockerfileContainer"
										},
										{
											"$ref": "#/definitions/imageContainer"
										}
									]
								},
								{
									"$ref": "#/definitions/nonComposeBase"
								}
							]
						},
						{
							"$ref": "#/definitions/composeContainer"
						}
					]
				},
				{
					"$ref": "#/definitions/devContainerCommon"
				}
			]
		},
		{
			"type": "object",
			"$ref": "#/definitions/devContainerCommon",
			"additionalProperties": false
		}
	]
}
Main Schema
{
    "allOf": [
        {
            "$ref": "./devContainer.base.schema.json"
        },
        {
            "$ref": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/configuration-editing/schemas/devContainer.codespaces.schema.json"
        },
        {
            "$ref": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/configuration-editing/schemas/devContainer.vscode.schema.json"
        }
    ]
}
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Dev Container metadata reference
The devcontainer.json file contains any needed metadata and settings required to configurate a development container for a given well-defined tool and runtime stack. It can be used by tools and services that support the dev container spec to create a development environment that contains one or more development containers.

Metadata properties marked with a 🏷️️ can be stored in the devcontainer.metadata container image label in addition to devcontainer.json. This label can contain an array of json snippets that will be automatically merged with devcontainer.json contents (if any) when a container is created.

General devcontainer.json properties
Property	Type	Description
name	string	A name for the dev container displayed in the UI.
forwardPorts 🏷️	array	An array of port numbers or "host:port" values (e.g. [3000, "db:5432"]) that should always be forwarded from inside the primary container to the local machine (including on the web). The property is most useful for forwarding ports that cannot be auto-forwarded because the related process that starts before the devcontainer.json supporting service / tool connects or for forwarding a service not in the primary container in Docker Compose scenarios (e.g. "db:5432"). Defaults to [].
portsAttributes 🏷️	object	Object that maps a port number, "host:port" value, range, or regular expression to a set of default options. See port attributes for available options. For example:
"portsAttributes": {"3000": {"label": "Application port"}}
otherPortsAttributes 🏷️	object	Default options for ports, port ranges, and hosts that aren’t configured using portsAttributes. See port attributes for available options. For example:
"otherPortsAttributes": {"onAutoForward": "silent"}
containerEnv 🏷️	object	A set of name-value pairs that sets or overrides environment variables for the container. Environment and pre-defined variables may be referenced in the values. For example:
"containerEnv": { "MY_VARIABLE": "${localEnv:MY_VARIABLE}" }
If you want to reference an existing container variable while setting this one (like updating the PATH), use remoteEnv instead.
containerEnv will set the variable on the Docker container itself, so all processes spawned in the container will have access to it. But it will also be static for the life of the container - you must rebuild the container to update the value.
We recommend using containerEnv (over remoteEnv) as much as possible since it allows all processes to see the variable and isn’t client-specific.
remoteEnv 🏷️	object	A set of name-value pairs that sets or overrides environment variables for the devcontainer.json supporting service / tool (or sub-processes like terminals) but not the container as a whole. Environment and pre-defined variables may be referenced in the values.
You may want to use remoteEnv (over containerEnv) if the value isn’t static since you can update its value without having to rebuild the full container.
remoteUser 🏷️	string	Overrides the user that devcontainer.json supporting services tools / runs as in the container (along with sub-processes like terminals, tasks, or debugging). Does not change the user the container as a whole runs as which can be set using containerUser. Defaults to the user the container as a whole is running as (often root).
You may learn more in the remoteUser section below.
containerUser 🏷️	string	Overrides the user for all operations run as inside the container. Defaults to either root or the last USER instruction in the related Dockerfile used to create the image. If you want any connected tools or related processes to use a different user than the one for the container, see remoteUser.
updateRemoteUserUID 🏷️	boolean	On Linux, if containerUser or remoteUser is specified, the user’s UID/GID will be updated to match the local user’s UID/GID to avoid permission problems with bind mounts. Defaults to true.
userEnvProbe 🏷️	enum	Indicates the type of shell to use to “probe” for user environment variables to include in devcontainer.json supporting services’ / tools’ processes: none, interactiveShell, loginShell, or loginInteractiveShell (default). The specific shell used is based on the default shell for the user (typically bash). For example, bash interactive shells will typically include variables set in /etc/bash.bashrc and ~/.bashrc while login shells usually include variables from /etc/profile and ~/.profile. Setting this property to loginInteractiveShell will get variables from all four files.
overrideCommand 🏷️	boolean	Tells devcontainer.json supporting services / tools whether they should run /bin/sh -c "while sleep 1000; do :; done" when starting the container instead of the container’s default command (since the container can shut down if the default command fails). Set to false if the default command must run for the container to function properly. Defaults to true for when using an image Dockerfile and false when referencing a Docker Compose file.
shutdownAction 🏷️	enum	Indicates whether devcontainer.json supporting tools should stop the containers when the related tool window is closed / shut down.
Values are none, stopContainer (default for image or Dockerfile), and stopCompose (default for Docker Compose).
init 🏷️	boolean	Defaults to false. Cross-orchestrator way to indicate whether the tini init process should be used to help deal with zombie processes.
privileged 🏷️	boolean	Defaults to false. Cross-orchestrator way to cause the container to run in privileged mode (--privileged). Required for things like Docker-in-Docker, but has security implications particularly when running directly on Linux.
capAdd 🏷️	array	Defaults to []. Cross-orchestrator way to add capabilities typically disabled for a container. Most often used to add the ptrace capability required to debug languages like C++, Go, and Rust. For example:
"capAdd": ["SYS_PTRACE"]
securityOpt 🏷️	array	Defaults to []. Cross-orchestrator way to set container security options. For example:
"securityOpt": [ "seccomp=unconfined" ]
mounts 🏷️	string or object	Defaults to unset. Cross-orchestrator way to add additional mounts to a container. Each value is a string that accepts the same values as the Docker CLI --mount flag. Environment and pre-defined variables may be referenced in the value. For example:
"mounts": [{ "source": "dind-var-lib-docker", "target": "/var/lib/docker", "type": "volume" }]
features	object	An object of Dev Container Feature IDs and related options to be added into your primary container. The specific options that are available varies by feature, so see its documentation for additional details. For example:
"features": { "ghcr.io/devcontainers/features/github-cli": {} }
overrideFeatureInstallOrder	array	By default, Features will attempt to automatically set the order they are installed based on a installsAfter property within each of them. This property allows you to override the Feature install order when needed. For example:
"overrideFeatureInstallОrder": [ "ghcr.io/devcontainers/features/common-utils", "ghcr.io/devcontainers/features/github-cli" ]
customizations 🏷️	object	Product specific properties, defined in supporting tools
Scenario specific properties
The focus of devcontainer.json is to describe how to enrich a container for the purposes of development rather than acting as a multi-container orchestrator format. Instead, container orchestrator formats can be referenced when needed to manage multiple containers and their lifecycles. Today, devcontainer.json includes scenario specific properties for working without a container orchestrator (by directly referencing an image or Dockerfile) and for using Docker Compose as a simple multi-container orchestrator.

Image or Dockerfile specific properties
Property	Type	Description
image	string	Required when using an image. The name of an image in a container registry (DockerHub, GitHub Container Registry, Azure Container Registry) that devcontainer.json supporting services / tools should use to create the dev container.
build.dockerfile	string	Required when using a Dockerfile. The location of a Dockerfile that defines the contents of the container. The path is relative to the devcontainer.json file.
build.context	string	Path that the Docker build should be run from relative to devcontainer.json. For example, a value of ".." would allow you to reference content in sibling directories. Defaults to ".".
build.args	Object	A set of name-value pairs containing Docker image build arguments that should be passed when building a Dockerfile. Environment and pre-defined variables may be referenced in the values. Defaults to not set. For example: "build": { "args": { "MYARG": "MYVALUE", "MYARGFROMENVVAR": "${localEnv:VARIABLE_NAME}" } }
build.options	array	An array of Docker image build options that should be passed to the build command when building a Dockerfile. Defaults to []. For example: "build": { "options": [ "--add-host=host.docker.internal:host-gateway" ] }
build.target	string	A string that specifies a Docker image build target that should be passed when building a Dockerfile. Defaults to not set. For example: "build": { "target": "development" }
build.cacheFrom	string,
array	A string or array of strings that specify one or more images to use as caches when building the image. Cached image identifiers are passed to the docker build command with --cache-from.
appPort	integer,
string,
array	In most cases, we recommend using the new forwardPorts property. This property accepts a port or array of ports that should be published locally when the container is running. Unlike forwardPorts, your application may need to listen on all interfaces (0.0.0.0) not just localhost for it to be available externally. Defaults to [].
Learn more about publishing vs forwarding ports here.
Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array properties.
workspaceMount	string	Requires workspaceFolder be set as well. Overrides the default local mount point for the workspace when the container is created. Supports the same values as the Docker CLI --mount flag. Environment and pre-defined variables may be referenced in the value. For example:
"workspaceMount": "source=${localWorkspaceFolder}/sub-folder,target=/workspace,type=bind,consistency=cached", "workspaceFolder": "/workspace"
workspaceFolder	string	Requires workspaceMount be set. Sets the default path that devcontainer.json supporting services / tools should open when connecting to the container. Defaults to the automatic source code mount location.
runArgs	array	An array of Docker CLI arguments that should be used when running the container. Defaults to []. For example, this allows ptrace based debuggers like C++ to work in the container:
"runArgs": [ "--cap-add=SYS_PTRACE", "--security-opt", "seccomp=unconfined" ] .
Docker Compose specific properties
Property	Type	Description
dockerComposeFile	string,
array	Required when using Docker Compose. Path or an ordered list of paths to Docker Compose files relative to the devcontainer.json file. Using an array is useful when extending your Docker Compose configuration. The order of the array matters since the contents of later files can override values set in previous ones.
The default .env file is picked up from the root of the project, but you can use env_file in your Docker Compose file to specify an alternate location.
Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array properties.
service	string	Required when using Docker Compose. The name of the service devcontainer.json supporting services / tools should connect to once running.
runServices	array	An array of services in your Docker Compose configuration that should be started by devcontainer.json supporting services / tools. These will also be stopped when you disconnect unless "shutdownAction" is "none". Defaults to all services.
workspaceFolder	string	Sets the default path that devcontainer.json supporting services / tools should open when connecting to the container (which is often the path to a volume mount where the source code can be found in the container). Defaults to "/".
Tool-specific properties
While most properties apply to any devcontainer.json supporting tool or service, a few are specific to certain tools. You may explore this in the supporting tools and services document.

Lifecycle scripts
When creating or working with a dev container, you may need different commands to be run at different points in the container’s lifecycle. The table below lists a set of command properties you can use to update what the container’s contents in the order in which they are run (for example, onCreateCommand will run after initializeCommand). Each command property is an string or list of command arguments that should execute from the workspaceFolder.

Property	Type	Description
initializeCommand	string,
array,
object	A command string or list of command arguments to run on the host machine during initialization, including during container creation and on subsequent starts. The command may run more than once during a given session.

⚠️ The command is run wherever the source code is located on the host. For cloud services, this is in the cloud.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
onCreateCommand 🏷️	string,
array,
object	This command is the first of three (along with updateContentCommand and postCreateCommand) that finalizes container setup when a dev container is created. It and subsequent commands execute inside the container immediately after it has started for the first time.

Cloud services can use this command when caching or prebuilding a container. This means that it will not typically have access to user-scoped assets or secrets.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
updateContentCommand 🏷️	string,
array,
object	This command is the second of three that finalizes container setup when a dev container is created. It executes inside the container after onCreateCommand whenever new content is available in the source tree during the creation process.

It will execute at least once, but cloud services will also periodically execute the command to refresh cached or prebuilt containers. Like cloud services using onCreateCommand, it can only take advantage of repository and org scoped secrets or permissions.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
postCreateCommand 🏷️	string,
array,
object	This command is the last of three that finalizes container setup when a dev container is created. It happens after updateContentCommand and once the dev container has been assigned to a user for the first time.

Cloud services can use this command to take advantage of user specific secrets and permissions.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
postStartCommand 🏷️	string,
array,
object	A command to run each time the container is successfully started.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
postAttachCommand 🏷️	string,
array,
object	A command to run each time a tool has successfully attached to the container.

Note that the array syntax will execute the command without a shell. You can learn more about formatting string vs array vs object properties.
waitFor 🏷️	enum	An enum that specifies the command any tool should wait for before connecting. Defaults to updateContentCommand. This allows you to use onCreateCommand or updateContentCommand for steps that must happen before devcontainer.json supporting tools connect while still using postCreateCommand for steps that can happen behind the scenes afterwards.
For each command property, if the value is a single string, it will be run in /bin/sh. Use && in a string to execute multiple commands. For example, "yarn install" or "apt-get update && apt-get install -y curl". The array syntax ["yarn", "install"] will invoke the command (in this case yarn) directly without using a shell. Each fires after your source code has been mounted, so you can also run shell scripts from your source tree. For example: bash scripts/install-dev-tools.sh.

If one of the lifecycle scripts fails, any subsequent scripts will not be executed. For instance, if postCreateCommand fails, postStartCommand and any following scripts will be skipped.

Minimum host requirements
While devcontainer.json does not focus on hardware or VM provisioning, it can be useful to know your container’s minimum RAM, CPU, and storage requirements. This is what the hostRequirements properties allow you to do. Cloud services can use these properties to automatically default to the best compute option available, while in other cases, you will be presented with a warning if the requirements are not met.

Property	Type	Description
hostRequirements.cpus 🏷️	integer	Indicates the minimum required number of CPUs / virtual CPUs / cores. For example: "hostRequirements": {"cpus": 2}
hostRequirements.memory 🏷️	string	A string indicating minimum memory requirements with a tb, gb, mb, or kb suffix. For example, "hostRequirements": {"memory": "4gb"}
hostRequirements.storage 🏷️	string	A string indicating minimum storage requirements with a tb, gb, mb, or kb suffix. For example, "hostRequirements": {"storage": "32gb"}
hostRequirements.gpu 🏷️	boolean,
string,
object	Indicates if any GPU is required. A boolean indicates if a GPU is required or not. The string "optional" indicates that a GPU is used when available, but is not required.

The object syntax specifies how much GPU resources are required. The cores property indicates the minimum number of cores and the memory property indicates minimum storage requirements with a tb, gb, mb, or kb suffix. For example, "gpu": { "cores": 1000, "storage": "32gb" }
Port attributes
The portsAttributes and otherPortsAttributes properties allow you to map default port options for one or more manually or automatically forwarded ports. The following is a list of options that can be set in the configuration object assigned to the property.

Property	Type	Description
label 🏷️	string	Display name for the port in the ports view. Defaults to not set.
protocol 🏷️	enum	Controls protocol handling for forwarded ports. When not set, the port is assumed to be a raw TCP stream which, if forwarded to localhost, supports any number of protocols. However, if the port is forwarded to a web URL (e.g. from a cloud service on the web), only HTTP ports in the container are supported. Setting this property to https alters handling by ignoring any SSL/TLS certificates present when communicating on the port and using the correct certificate for the forwarded URL instead (e.g https://*.githubpreview.dev). If set to http, processing is the same as if the protocol is not set. Defaults to not set.
onAutoForward 🏷️	enum	Controls what should happen when a port is auto-forwarded once you’ve connected to the container. notify is the default, and a notification will appear when the port is auto-forwarded. If set to openBrowser, the port will be opened in the system’s default browser. A value of openBrowserOnce will open the browser only once. openPreview will open the URL in devcontainer.json supporting services’ / tools’ embedded preview browser. A value of silent will forward the port, but take no further action. A value of ignore means that this port should not be auto-forwarded at all.
requireLocalPort 🏷️	boolean	Dictates when port forwarding is required to map the port in the container to the same port locally or not. If set to false, the devcontainer.json supporting services / tools will attempt to use the specified port forward to localhost, and silently map to a different one if it is unavailable. If set to true, you will be notified if it is not possible to use the same port. Defaults to false.
elevateIfNeeded 🏷️	boolean	Forwarding low ports like 22, 80, or 443 to localhost on the same port from devcontainer.json supporting services / tools may require elevated permissions on certain operating systems. Setting this property to true will automatically try to elevate the devcontainer.json supporting tool’s permissions in this situation. Defaults to false.
Formatting string vs. array properties
The format of certain properties will vary depending on the involvement of a shell.

postCreateCommand, postStartCommand, postAttachCommand, and initializeCommand all have 3 types:

Array: Passed to the OS for execution without going through a shell
String: Goes through a shell (it needs to be parsed into command and arguments)
Object: All lifecycle scripts have been extended to support object types to allow for parallel execution
runArgs only has the array type. Using runArgs via a typical command line, you’ll need single quotes if the shell runs into parameters with spaces. However, these single quotes aren’t passed on to the executable. Thus, in your devcontainer.json, you’d follow the array format and leave out the single quotes:

"runArgs": ["--device-cgroup-rule=my rule here"]
Rather than:

"runArgs": ["--device-cgroup-rule='my rule here'"]
We can compare the string, array, and object versions of postAttachCommand as well. You can use the following string format, which will remove the single quotes as part of the shell’s parsing:

"postAttachCommand": "echo foo='bar'"
By contrast, the array format will keep the single quotes and write them to standard out (you can see the output in the dev container log):

"postAttachCommand": ["echo", "foo='bar'"]
Finally, you may use an object format:

{
  "postAttachCommand": {
    "server": "npm start",
    "db": ["mysql", "-u", "root", "-p", "my database"]
  }
}
Variables in devcontainer.json
Variables can be referenced in certain string values in devcontainer.json in the following format: ${variableName}. The following is a list of available variables you can use.

Variable	Properties	Description
${localEnv:VARIABLE_NAME}	Any	Value of an environment variable on the host machine (in the examples below, called VARIABLE_NAME). Unset variables are left blank.

⚠️ Clients (like VS Code) may need to be restarted to pick up newly set variables.

⚠️ For a cloud service, the host is in the cloud rather than your local machine.

Examples

1. Set a variable containing your local home folder on Linux / macOS or the user folder on Windows:
"remoteEnv": { "LOCAL_USER_PATH": "${localEnv:HOME}${localEnv:USERPROFILE}" }.

A default value for when the environment variable is not set can be given with ${localEnv:VARIABLE_NAME:default_value}.

2. In modern versions of macOS, default configurations allow setting local variables with the command echo 'export VARIABLE_NAME=my-value' >> ~/.zshenv.
${containerEnv:VARIABLE_NAME}	remoteEnv	Value of an existing environment variable inside the container once it is up and running (in this case, called VARIABLE_NAME). For example:
"remoteEnv": { "PATH": "${containerEnv:PATH}:/some/other/path" }

A default value for when the environment variable is not set can be given with ${containerEnv:VARIABLE_NAME:default_value}.
${localWorkspaceFolder}	Any	Path of the local folder that was opened in the devcontainer.json supporting service / tool (that contains .devcontainer/devcontainer.json).
${containerWorkspaceFolder}	Any	The path that the workspaces files can be found in the container.
${localWorkspaceFolderBasename}	Any	Name of the local folder that was opened in the devcontainer.json supporting service / tool (that contains .devcontainer/devcontainer.json).
${containerWorkspaceFolderBasename}	Any	Name of the folder where the workspace files can be found in the container.
${devcontainerId}	Any	Allow Features to refer to an identifier that is unique to the dev container they are installed into and that is stable across rebuilds.
The properties supporting it in devcontainer.json are: name, runArgs, initializeCommand, onCreateCommand, updateContentCommand, postCreateCommand, postStartCommand, postAttachCommand, workspaceFolder, workspaceMount, mounts, containerEnv, remoteEnv, containerUser, remoteUser, and customizations.
Schema
You can see the dev container schema here.

Publishing vs forwarding ports
Docker has the concept of “publishing” ports when the container is created. Published ports behave very much like ports you make available to your local network. If your application only accepts calls from localhost, it will reject connections from published ports just as your local machine would for network calls. Forwarded ports, on the other hand, actually look like localhost to the application.

remoteUser
A dev container configuration will inherit the remoteUser property from the base image it uses.

Using the images and Templates part of the spec as an example: remoteUser in these images is set to a custom value - you may view an example in the C++ image. The C++ Template will then inherit the custom remoteUser value from its base C++ image.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Dev Container Features reference
Development Container Features are self-contained, shareable units of installation code and development container configuration. The name comes from the idea that referencing one of them allows you to quickly and easily add more tooling, runtime, or library “features” into your development container for you or your collaborators to use.

Feature metadata is captured by a devcontainer-feature.json file in the root folder of the feature.

Note: While Features may be installed on top of any base image, the implementation of a Feature might restrict it to a subset of possible base images. For example, some Features may be authored to work with a certain Linux distro (e.g. debian-based images that use the apt package manager).

This page covers details on the Features specification. If you are looking for summarized information on creating your own Features, check out the quick start and core Features repositories.

Folder Structure
A Feature is a self contained entity in a folder with at least a devcontainer-feature.json and install.sh entrypoint script. Additional files are permitted and are packaged along side the required files.

+-- feature
|    +-- devcontainer-feature.json
|    +-- install.sh
|    +-- (other files)
devcontainer-feature.json properties
The devcontainer-feature.json file defines metadata about a given Feature.

All properties are optional except for id, version, and name.

devContainerFeature.schema.json defines the schema for the devcontainer-feature.json file.

The properties of the file are as follows:

Property	Type	Description
id	string	Required: Identifier of the Feature. Must be unique in the context of the repository where the Feature exists and must match the name of the directory where the devcontainer-feature.json resides.
version	string	Required: The semantic version of the Feature (e.g: 1.0.0).
name	string	Required: A “human-friendly” display name for the Feature.
description	string	Description of the Feature.
documentationURL	string	Url that points to the documentation of the Feature.
licenseURL	string	Url that points to the license of the Feature.
keywords	array	List of strings relevant to a user that would search for this definition/Feature.
options	object	A map of options that will be passed as environment variables to the execution of the script.
containerEnv	object	A set of name value pairs that sets or overrides environment variables.
privileged	boolean	Sets privileged mode for the container (required by things like docker-in-docker) when the feature is used.
init	boolean	Adds the tiny init process to the container (--init) when the Feature is used.
capAdd	array	Adds container capabilities when the Feature is used.
securityOpt	array	Sets container security options like updating the seccomp profile when the Feature is used.
entrypoint	string	Set if the feature requires an “entrypoint” script that should fire at container start up.
customizations	object	Product specific properties, each namespace under customizations is treated as a separate set of properties. For each of this sets the object is parsed, values are replaced while arrays are set as a union.
dependsOn	object	An object (**) of Feature dependencies that must be satisified before this Feature is installed. Elements follow the same semantics of the features object in devcontainer.json. See Installation Order for further information.
installsAfter	array	Array of ID’s of Features (omitting a version tag) that should execute before this one. Allows control for Feature authors on soft dependencies between different Features. See Installation Order for further information.
legacyIds	array	Array of old IDs used to publish this Feature. The property is useful for renaming a currently published Feature within a single namespace.
deprecated	boolean	Indicates that the Feature is deprecated, and will not receive any further updates/support. This property is intended to be used by the supporting tools for highlighting Feature deprecation.
mounts	object	Defaults to unset. Cross-orchestrator way to add additional mounts to a container. Each value is an object that accepts the same values as the Docker CLI --mount flag. The Pre-defined devcontainerId variable may be referenced in the value. For example:
"mounts": [{ "source": "dind-var-lib-docker", "target": "/var/lib/docker", "type": "volume" }]
(**) The ID must refer to either a Feature (1) published to an OCI registry, (2) a Feature Tgz URI, or (3) a Feature in the local file tree. Deprecated Feature identifiers (i.e GitHub Release) are not supported and the presence of this property may be considered a fatal error or ignored. For local Features (ie: during development), you may also depend on other local Features by providing a relative path to the Feature, relative to folder containing the active devcontainer.json. This behavior of Features within this property again mirror the features object in devcontainer.json.

Lifecycle Hooks
The following lifecycle hooks may be declared as properties of devcontainer-feature.json.

Property	Type
onCreateCommand	string, array, object
updateContentCommand	string, array, object
postCreateCommand	string, array, object
postStartCommand	string, array, object
postAttachCommand	string, array, object
Behavior
Each property mirrors the behavior of the matching property in devcontainer.json, including the behavior that commands are executed from the context of the project workspace folder.

For each lifecycle hook (in Feature installation order), each command contributed by a Feature is executed in sequence (blocking the next command from executing). Commands provided by Features are always executed before any user-provided lifecycle commands (i.e: in the devcontainer.json).

If a Feature provides a given command with the object syntax, all commands within that group are executed in parallel, but still blocking commands from subsequent Features and/or the devcontainer.json.

Note: These properties are stored within image metadata.

Writing scripts to known container path
It may be helpful for a Feature to write scripts to a known, persistent path within the container (i.e. for later use in a given lifecycle hook).

Take for instance the git-lfs Feature, which writes a script to /usr/local/share/pull-git-lfs-artifacts.sh during installation.

install.sh
PULL_GIT_LFS_SCRIPT_PATH="/usr/local/share/pull-git-lfs-artifacts.sh"

tee "$PULL_GIT_LFS_SCRIPT_PATH" > /dev/null \
<< EOF
#!/bin/sh
set -e
<...truncated...>
EOF
This script is then executed during the postCreateCommand lifecycle hook.

devcontainer-feature.json
{
    "id": "git-lfs",
    "version": "1.1.0",
    "name": "Git Large File Support (LFS)",
    // <...truncated...>
    "postCreateCommand": "/usr/local/share/pull-git-lfs-artifacts.sh",
    "installsAfter": [
        "ghcr.io/devcontainers/features/common-utils"
    ]
}
The options property
The options property contains a map of option IDs and their related configuration settings. The ID becomes the name of the environment variable in all caps. See option resolution for more details. For example:

{
  "options": {
    "optionIdGoesHere": {
      "type": "string",
      "description": "Description of the option",
      "proposals": ["value1", "value2"],
      "default": "value1"
    }
  }
}
Property	Type	Description
optionId	string	ID of the option that is converted into an all-caps environment variable with the selected value in it.
optionId.type	string	Type of the option. Valid types are currently: boolean, string
optionId.proposals	array	A list of suggested string values. Free-form values are allowed. Omit when using optionId.enum.
optionId.enum	array	A strict list of allowed string values. Free-form values are not allowed. Omit when using optionId.proposals.
optionId.default	string or boolean	Default value for the option.
optionId.description	string	Description for the option.
User environment variables
Feature scripts run as the root user and sometimes need to know which user account the dev container will be used with.

_REMOTE_USER and _CONTAINER_USER environment variables are passsed to the Features scripts with _CONTAINER_USER being the container’s user and _REMOTE_USER being the configured remoteUser. If no remoteUser is configured, _REMOTE_USER is set to the same value as _CONTAINER_USER.

Additionally, the home folders of the two users are passed to the Feature scripts as _REMOTE_USER_HOME and _CONTAINER_USER_HOME environment variables.

The container user can be set with containerUser in the devcontainer.json and image metadata, user in the docker-compose.yml, USER in the Dockerfile, and can be passed down from the base image.

Dev Container ID
An identifier will be referred to as ${devcontainerId} in the devcontainer.json and the Feature metadata and that will be replaced with the dev container’s id. It should only be used in parts of the configuration and metadata that is not used for building the image because that would otherwise prevent pre-building the image at a time when the dev container’s id is not known yet. Excluding boolean, numbers and enum properties the properties supporting ${devcontainerId} in the Feature metadata are: entrypoint, mounts, customizations.

Implementations can choose how to compute this identifier. They must ensure that it is unique among other dev containers on the same Docker host and that it is stable across rebuilds of dev containers. The identifier must only contain alphanumeric characters. We describe a way to do this below.

Label-based Implementation
The following assumes that a dev container can be identified among other dev containers on the same Docker host by a set of labels on the container. Implementations may choose to follow this approach.

The identifier is derived from the set of container labels uniquely identifying the dev container. It is up to the implementation to choose these labels. E.g., if the dev container is based on a local folder the label could be named devcontainer.local_folder and have the local folder’s path as its value.

E.g., the ghcr.io/devcontainers/features/docker-in-docker Feature could use the dev container id with:

{
    "id": "docker-in-docker",
    "version": "1.0.4",
    // ...
    "mounts": [
        {
            "source": "dind-var-lib-docker-${devcontainerId}",
            "target": "/var/lib/docker",
            "type": "volume"
        }
    ]
}
Label-based Computation
Input the labels as a JSON object with the object’s keys being the label names and the object’s values being the labels’ values.
To ensure implementations get to the same result, the object keys must be sorted and any optional whitespace outside of the keys and values must be removed.
Compute a SHA-256 hash from the UTF-8 encoded input string.
Use a base-32 encoded representation left-padded with ‘0’ to 52 characters as the result.
JavaScript implementation taking an object with the labels as argument and returning a string as the result:

const crypto = require('crypto');
function uniqueIdForLabels(idLabels) {
	const stringInput = JSON.stringify(idLabels, Object.keys(idLabels).sort()); // sort properties
	const bufferInput = Buffer.from(stringInput, 'utf-8');
	const hash = crypto.createHash('sha256')
		.update(bufferInput)
		.digest();
	const uniqueId = BigInt(`0x${hash.toString('hex')}`)
		.toString(32)
		.padStart(52, '0');
	return uniqueId;
}
devcontainer.json properties
Features are referenced in a user’s devcontainer.json under the top level features object.

A user can specify an arbitrary number of Features. At build time, these Features will be installed in an order defined by a combination of the installation order rules and implementation.

A single Feature is provided as a key/value pair, where the key is the Feature identifier, and the value is an object containing “options” (or empty for “default”). Each key in the feature object must be unique.

These options are sourced as environment variables at build-time, as specified in Option Resolution.

Below is a valid features object provided as an example.

"features": {
  "ghcr.io/user/repo/go": {},
  "ghcr.io/user/repo1/go:1": {},
  "ghcr.io/user/repo2/go:latest": {},
  "https://github.com/user/repo/releases/devcontainer-feature-go.tgz": { 
        "optionA": "value" 
  },
  "./myGoFeature": { 
        "optionA": true,
        "optionB": "hello",
        "version" : "1.0.0"
  }
}
Note: The :latest version annotation is added implicitly if omitted. To pin to a specific package version (example), append it to the end of the Feature.

An option’s value can be provided as either a string or boolean, and should match what is expected by the feature in the devcontainer-feature.json file.

As a shorthand, the value of the features property can be provided as a single string. This string is mapped to an option called version. In the example below, both examples are equivalent.

"features": {
  "ghcr.io/owner/repo/go": "1.18"
}
"features": {
  "ghcr.io/owner/repo/go": {
    "version": "1.18"
  }
}
Referencing a Feature
The id format specified dicates how a supporting tool will locate and download a given feature. id is one of the following:

Type	Description	Example
<oci-registry>/<namespace>/<feature>[:<semantic-version>]	Reference to feature in OCI registry(*)	ghcr.io/user/repo/go
ghcr.io/user/repo/go:1
ghcr.io/user/repo/go:latest
https://<uri-to-feature-tgz>	Direct HTTPS URI to a tarball.	https://github.com/user/repo/releases/devcontainer-feature-go.tgz
./<path-to-feature-dir>	A relative directory(**) to folder containing a devcontainer-feature.json.	./myGoFeature
(*) OCI registry must implement the OCI Artifact Distribution Specification. Some implementors can be found here.

(**) The provided path is always relative to the folder containing the devcontainer.json. Further requirements are outlined in the Locally Referenced Addendum.

Versioning
Each Feature is individually versioned according to the semver specification. The version property in the respective devcontainer-feature.json file is updated to increment the Feature’s version.

Tooling that handles releasing Features will not republish Features if that exact version has already been published; however, tooling must republish major and minor versions in accordance with the semver specification.

Authoring
Features can be authored in a number of languages, the most straightforward being bash scripts. If a Feature is authored in a different language, information about it should be included in the metadata so that users can make an informed choice about it.

Reference information about the application required to execute the Feature should be included in devcontainer-feature.json in the metadata section.

Applications should default to /bin/sh for Features that do not include this information.

If the Feature is included in a folder as part of the repository that contains devcontainer.json, no other steps are necessary.

Release
For information on distributing Features, see the Features distribution page.

Execution
Invoking install.sh
The install.sh script for each Feature should be executed as root during a container image build. This allows the script to add needed OS dependencies or settings that could not otherwise be modified. This also allows the script to switch into another user’s context using the su command (e.g., su ${USERNAME} -c "command-goes-here"). In combination, this allows both root and non-root image modifications to occur even if sudo is not present in the base image for security reasons.

To ensure that the appropriate shell is used, the execute bit should be set on install.sh and the file invoked directly (e.g. chmod +x install.sh && ./install.sh).

Note: It is recommended that Feature authors write install.sh using a shell available by default in their supported distributions (e.g., bash in Debian/Ubuntu or Fedora, sh in Alpine). In the event a different shell is required (e.g., fish), install.sh can be used to boostrap by checking for the presence of the desired shell, installing it if needed, and then invoking a secondary script using the shell.

The install.sh file can similarly be used to bootstrap something written in a compiled language like Go. Given the increasing likelihood that a Feature needs to work on both x86_64 and arm64-based devices (e.g., Apple Silicon Macs), install.sh can detect the current architecture (e.g., using something like uname -m or dpkg --print-architecture), and then invoke the right executable for that architecture.

Installation order
By default, Features are installed on top of a base image in an order determined as optimal by the implementing tool.

If any of the following properties are provided in the Feature’s devcontainer-feature.json, or the user’s devcontainer.json, the order indicated by these propert(ies) are respected.

The dependsOn property defined as a part of a Feature’s devcontainer-feature.json.
The installsAfter property defined as part of a Feature’s devcontainer-feature.json.
The overrideFeatureInstallOrder property in user’s devcontainer.json. Allows users to control the order of execution of their Features.
dependsOn
The optional dependsOn property indicates a set of required, “hard” dependencies for a given Feature.

The dependsOn property is declared in a Feature’s devcontainer-feature.json metadata file. Elements of this property mirror the semantics of the features object in devcontainer.json. Therefore, all dependencies may provide the relevant options, or an empty object (eg: "bar:123": {}) if the Feature’s default options are sufficient. Identical Features that provide different options are treated as different Features (see Feature equality for more info).

All Features indicated in the dependsOn property must be satisfied (a Feature equal to each dependency is present in the installation order) before the given Feature is set to be installed. If any of the Features indicated in the dependsOn property cannot be installed (e.g due to circular dependency, failure to resolve the Feature, etc) the entire dev container creation should fail.

The dependsOn property must be evaluated recursively. Therefore, if a Feature dependency has its own dependsOn property, that Feature’s dependencies must also be satisfied before the given Feature is installed.

{
    "name": "My Feature",
    "id": "myFeature",
    "version": "1.0.0",
    "dependsOn": {
        "foo:1": {
            "flag": true
        },
        "bar:1.2.3": {},
        "baz@sha256:a4cdc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" {},
    }
}
In the snippet above, myfeature MUST be installed after foo, bar, and baz. If the Features provided via the dependsOn property declare their own dependencies, those must also be satisfied before the Feature is installed.

installsAfter
The installsAfter property indicates a “soft dependency” that influences the installation order of Features that are already queued to be installed. The effective behavior of this property is the same as dependsOn, with the following differences:

installsAfter is not evaluated recursively.
installsAfter only influences the installation order of Features that are already set to be installed. Any Feature not set to be installed after (1) resolving the dependsOn dependency tree or (2) indicated by the user’s devcontainer.json should not be added to the installation list.
The Feature indicated by installsAfter can not provide options, nor are they able to be pinned to a specific version tag or digest. Resolution to the canonical name should still be performed (eg: If the Feature has been renamed).
{
    "name": "My Feature",
    "id": "myFeature",
    "version": "1.0.0",
    "installsAfter": [
        "foo",
        "bar"
    ]
}
In the snippet above, myfeature must be installed after foo and bar if the Feature is already queued to be installed. If second and third are not already queued to be installed, this dependency relationship should be ignored.

overrideFeatureInstallOrder
The overrideFeatureInstallOrder property of devcontainer.json is an array of Feature IDs that are to be installed in descending priority order as soon as its dependencies outlined above are installed.

This property may not indicate an installation order that is inconsistent with the resolved dependency graph (see dependency algorithm). If the overrideFeatureInstallOrder property is inconsistent with the dependency graph, the implementing tool should fail the dependency resolution step.

This evaluation is performed by assigning a roundPriority to all nodes that match match the Feature identifier (version omitted) present in the property.

For example, given n Features in the overrideFeatureInstallOrder array, the orchestrating tool should assign a roundPriority of n - idx to each Feature, where idx is the zero-based index of the Feature in the array.

For example:

overrideFeatureInstallOrder = [
  "foo",
  "bar",
  "baz"
]
would result in the following roundPriority assignments:

const roundPriority = {
  "foo": 3,
  "bar": 2,
  "baz": 1
}
This property must not influence the dependency relationship as defined by the dependency graph (see dependency graph) and shall only be evaulated at the round-based sorting step (see round sort). Put another way, this property cannot “pull forward” a Feature until all of its dependencies (both soft and hard) have been installed. After a Feature’s dependencies have been installed in other rounds, this property should “pull forward” each Feature as early as possible (given the order of identifiers in the array).

Similar to installsAfter, this property’s members may not provide options, nor are they able to be pinned to a specific version tag or digest.

If a Feature is indicated in overrideFeatureInstallOrder but not a member of the dependency graph (it is not queued to be installed), the orchestrating tool may fail the dependency resolution step.

Definitions
Definition: Feature Equality
This specification defines two Features as equal if both Features point to the same exact contents and are executed with > the same options.

For Features published to an OCI registry, two Feature are identical if their manifest digests are equal, and the > options executed against the Feature are equal (compared value by value). Identical manifest digests implies that the tgz contents of the Feature and its entire devcontainer-feature.json are identical. If any of these conditions are not met, the Features are considered not equal.

For Features fetched by HTTPS URI, two Features are identical if the contents of the tgz are identical (hash to the > same value), and the options executed against the Feature are equal (compared value by value). If any of these conditions are not met, the Features are considered not equal.

For local Features, each Feature is considered unique and not equal to any other local Feature.

Definition: Round Stable Sort
To prevent non-deterministic behavior, the algorithm will sort each round according to the following rules:

Compare and sort each Feature lexiographically by their fully qualified resource name (For OCI-published Features, that means the ID without version or digest.). If the comparison is equal:
Compare and sort each Feature from oldest to newest tag (latest being the “most new”). If the comparision is equal:
Compare and sort each Feature by their options by:
Greatest number of user-defined options (note omitting an option will default that value to the Feature’s default value and is not considered a user-defined option). If the comparison is equal:
Sort the provided option keys lexicographically. If the comparison is equal:
Sort the provided option values lexicographically. If the comparision is equal:
Sort Features by their canonical name (For OCI-published Features, the Feature ID resolved to the digest hash).
If there is no difference based on these comparator rules, the Features are considered equal.

Dependency installation order algorithm
An implementing tool is responsible for calculating the Feature installation order (or providing an error if no valid installation order can be resolved). The set of Features to be installed is the union of user-defined Features (those directly indicated in the user’s devcontainer.json and their dependencies (those indicated by the dependsOn or installsAfter property, taking into account the user dev container’s overrideFeatureInstallOrder property). The implmenting tool will perform the following steps:

(1) Build a dependency graph
From the user-defined Features, the orchestrating tool will build a dependency graph. The graph will be built by traversing the dependsOn and installsAfter properties of each Feature. The metadata for each dependency is then fetched and the node added as an edge to to the dependent Feature. For dependsOn dependencies, the dependency will be fed back into the worklist to be recursively resolved.

An accumulator is maintained with all uniquely discovered and user-provided Features, each with a reference to its dependencies. If the exact Feature (see Feature Equality) has already been added to the accumulator, it will not be added again. The accumulator will be fed into (B3) after the Feature tree has been resolved.

The graph may be stored as an adjacency list with two kinds of edges (1) dependsOn edges or “hard dependencies” and (2) installsAfter edges or “soft dependencies”.

(2) Assigning round priority
Each node in the graph has an implicit, default roundPriority of 0.

To influence installation order globally while still honoring the dependency graph of built in (1), roundPriority values may be tweaks for each Feature. When each round is calculated in (3), only the Features equal to the max roundPriority of that set will be committed (the remaining will be > uncommitted and reevaulated in subsequent rounds).

The roundPriority is set to a non-zero value in the following instances:

If the devcontainer.json contains an overrideFeatureInstallOrder.
(3) Round-based sorting
Perform a sort on the result of (1) in rounds. This sort will rearrange Features, producing a sorted list of Features to install. The sort will be performed as follows:

Start with all the elements from (2) in a worklist and an empty list installationOrder. While the worklist is not empty, iterate through each element in the worklist and check if all its dependencies (if any) are already members of installationOrder. If the check is true, add it to an intermediate list round If not, skip it. Equality is determined in Feature Equality.

Then for each intermediate round list, commit to installationOrder only those nodes who share the maximum roundPriority. Return all nodes in round with a strictly lower roundPriority to the worklist to be reprocessed in subsequent iterations. If there are multiple nodes with the same roundPriority, commit them to installationOrder with a final sort according to Round Stable Sort.

Repeat for as many rounds as necessary until worklist is empty. If there is ever a round where no elements are added to installationOrder, the algorithm should terminate and return an error. This indicates a circular dependency or other fatal error in the dependency graph. Implementations should attempt to provide the user with information about the error and possible mitigation strategies.

Notes
From an implementation point of view, installsAfter nodes may be added as a separate set of directed edges, just as dependsOn nodes are added as directed edges (see (1)). Before round-based installation and sorting (3), an orchestrating tool should remove all installsAfter directed edges that do not correspond with a Feature in the worklist that is set to be installed. In each round, a Feature can then be installed if all its requirements (both dependsOn and installsAfter dependencies) have been fulfilled in previous rounds.

An implemention should fail the dependency resolution step if the evaluation of the installsAfter property results in an inconsistent state (eg: a circular dependency).

Option Resolution
A Feature’s options - specified as the value of a single Feature key/value pair in the user’s devcontainer.json - are passed to the Feature as environment variables.

A supporting tool will parse the options object provided by the user. If a value is provided for a Feature, it will be emitted to a file named devcontainer-features.env following the format <OPTION_NAME>=<value>.

To ensure a option that is valid as an environment variable, the follow substitutions are performed:

(str: string) => str
	.replace(/[^\w_]/g, '_')
	.replace(/^[\d_]+/g, '_')
	.toUpperCase();
This file is sourced at build-time for the feature install.sh entrypoint script to handle.

Any options defined by a feature’s devcontainer-feature.json that are omitted in the user’s devcontainer.json will be implicitly exported as its default value.

Option resolution example
Suppose a python Feature has the following options parameters declared in the devcontainer-feature.json file:

// ...
"options": {
    "version": {
        "type": "string",
        "enum": ["latest", "3.10", "3.9", "3.8", "3.7", "3.6"],
        "default": "latest",
        "description": "Select a Python version to install."
    },
    "pip": {
        "type": "boolean",
        "default": true,
        "description": "Installs pip"
    },
    "optimize": {
        "type": "boolean",
        "default": true,
        "description": "Optimize python installation"
    }
}
The user’s devcontainer.json declared the python Feature like so:


"features": {
    "ghcr.io/devcontainers/features/python:1": {
        "version": "3.10",
        "pip": false
    }
}
The emitted environment variables will be:

VERSION="3.10"
PIP="false"
OPTIMIZE="true"
These will be sourced and visible to the install.sh entrypoint script. The following install.sh…

#!/usr/bin/env bash

echo "Version is $VERSION"
echo "Pip? $PIP"
echo "Optimize? $OPTIMIZE"
… outputs the following:

Version is 3.10
Pip? false
Optimize? true
Steps to rename a Feature
Update the Feature source code folder and the id property in the devcontainer-feature.json properties to reflect the new id. Other properties (name, documentationUrl, etc.) can optionally be updated during this step.
Add or update the legacyIds property to the Feature, including the previously used id.
Bump the semantic version of the Feature.
Rerun the devcontainer features publish command, or equivalent tool that implements the Features distribution specification.
Example: Renaming a Feature
Let’s say we currently have a docker-from-docker Feature 👇

Current devcontainer-feature.json :

{
    "id": "docker-from-docker",
    "version": "2.0.1",
    "name": "Docker (Docker-from-Docker)",
    "documentationURL": "https://github.com/devcontainers/features/tree/main/src/docker-from-docker",
    ....
}
We’d want to rename this Feature to docker-outside-of-docker. The source code folder of the Feature will be updated to docker-outside-of-docker and the updated devcontainer-feature.json will look like 👇

{
    "id": "docker-outside-of-docker",
    "version": "2.0.2",
    "name": "Docker (Docker-outside-of-Docker)",
    "documentationURL": "https://github.com/devcontainers/features/tree/main/src/docker-outside-of-docker",
    "legacyIds": [
        "docker-from-docker"
    ]
    ....
}
Note - The semantic version of the Feature defined by the version property should be continued and should not be restarted at 1.0.0.

Implementation notes
There are several things to keep in mind for an application that implements Features:

The order of execution of Features is determined by the application, based on the installsAfter property used by Feature authors. It can be overridden by users if necessary with the overrideFeatureInstallOrder in devcontainer.json.
Features are used to create an image that can be used to create a container or not.
Parameters like privileged, init are included if just 1 feature requires them.
Parameters like capAdd, securityOp are concatenated.
containerEnv is added before the feature is executed as ENV commands in the Dockerfile.
Each Feature script executes as its own layer to aid in caching and rebuilding.
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Dev container Features contribution and discovery
TL;DR Check out the quick start repository to get started on distributing your own Dev Container Features.

This specification defines a pattern where community members and organizations can author and self-publish Dev Container Features.

Goals include:

For Feature authors, create a “self-service” way to publish a Feature, either publicly or privately, that is not centrally controlled.
For users, provide the ability to validate the integrity of previously fetched Feature assets.
For users, provide the ability for a user to pin to a particular version (absolute, or semantic version) of a Feature to allow for consistent, repeatable environments.
Provide the ability to standardize publishing such that supporting tools may implement their own mechanism to aid Feature discoverability as they see fit.
Tip: This section covers details on the Features specification. If you are looking for summarized information on creating your own Features, check out the quick start and core Features repositories.

Source Code
Features source code is stored in a git repository.

For ease of authorship and maintenance, [1..n] features can share a single git repository. This set of Features is referred to as a “collection,” and will share the same devcontainer-collection.json file and “namespace” (eg. <owner>/<repo>).

Source code for the set follows the example file structure below:

.
├── README.md
├── src
│   ├── dotnet
│   │   ├── devcontainer-feature.json
│   │   ├── install.sh
│   │   └── ...
|   ├
│   ├── go
│   │   ├── devcontainer-feature.json
│   │   └── install.sh
|   ├── ...
│   │   ├── devcontainer-feature.json
│   │   └── install.sh
├── test
│   ├── dotnet
│   │   ├── test.sh
│   │   └── ...
│   └── go
│   |   └── test.sh
|   ├── ...
│   │   └── test.sh
├── ...
… where src is a directory containing a sub-folder with the name of the Feature (e.g. src/dotnet or src/go) with at least a file named devcontainer-feature.json that contains the Feature metadata, and an install.sh script that implementing tools will use as the entrypoint to install the Feature.

Each sub-directory should be named such that it matches the id field of the devcontainer-feature.json. Other files can also be included in the Feature’s sub-directory, and will be included during the packaging step alongside the two required files. Any files that are not part of the Feature’s sub-directory (e.g. outside of src/dotnet) will not included in the packaging step.

Optionally, a mirrored test directory can be included with an accompanying test.sh script. Implementing tools may use this to run tests against the given Feature.

Versioning
Each Feature is individually versioned according to the semver specification. The version property in the respective devcontainer-feature.json file is parsed to determine if the Feature should be republished.

Tooling that handles publishing Features will not republish Features if that exact version has already been published; however, tooling must republish major and minor versions in accordance with the semver specification.

Packaging
Features are distributed as tarballs. The tarball contains the entire contents of the Feature sub-directory, including the devcontainer-feature.json, install.sh, and any other files in the directory.

The tarball is named devcontainer-feature-<id>.tgz, where <id> is the Feature’s id field.

A reference implementation for packaging and distributing Features is provided as a GitHub Action.

devcontainer-collection.json
The devcontainer-collection.json is an auto-generated metadata file.

Property	Type	Description
sourceInformation	object	Metadata from the implementing packaging tool.
features	array	The list of features that are contained in this collection.
Each Features’s devcontainer-feature.json metadata file is appended into the features top-level array.

Distribution
There are several supported ways to distribute Features. Distribution is handled by the implementing packaging tool such as the Dev Container CLI or Dev Container Publish GitHub Action. See the quick start repository for a full working example.

A user references a distributed Feature in a devcontainer.json as defined in ‘referencing a Feature’.

OCI Registry
An OCI registry that implements the OCI Artifact Distribution Specification serves as the primary distribution mechanism for Features.

Each packaged Feature is pushed to the registry following the naming convention <registry>/<namespace>/<id>[:version], where version is the major, minor, and patch version of the Feature, according to the semver specification.

Note: The namespace is a unique identifier for the collection of Features. There are no strict rules for the namespace; however, one pattern is to set namespace equal to source repository’s <owner>/<repo>.

A custom media type application/vnd.devcontainers and application/vnd.devcontainers.layer.v1+tar are used as demonstrated below.

For example, the go Feature in the devcontainers/features namespace at version 1.2.3 would be pushed to the ghcr.io OCI registry.

Note: The example below uses oras for demonstration purposes. A supporting tool should directly implement the required functionality from the aforementioned OCI artifact distribution specification.

# ghcr.io/devcontainers/features/go:1 
REGISTRY=ghcr.io
NAMESPACE=devcontainers/features
FEATURE=go

ARTIFACT_PATH=devcontainer-feature-go.tgz

for VERSION in 1  1.2  1.2.3  latest
do
    oras push ${REGISTRY}/${NAMESPACE}/${FEATURE}:${VERSION} \
            --config /dev/null:application/vnd.devcontainers \
                             ./${ARTIFACT_PATH}:application/vnd.devcontainers.layer.v1+tar
done
The “namespace” is the globally identifiable name for the collection of Features. (eg: owner/repo for the source code’s git repository).

The auto-generated devcontainer-collection.json is pushed to the registry with the same namespace as above and no accompanying feature name. The collection file is always tagged as latest.

# ghcr.io/devcontainers/features
REGISTRY=ghcr.io
NAMESPACE=devcontainers/features

oras push ${REGISTRY}/${NAMESPACE}:latest \
        --config /dev/null:application/vnd.devcontainers \
                            ./devcontainer-collection.json:application/vnd.devcontainers.collection.layer.v1+json
Additionally, an annotation named dev.containers.metadata should be populated on the manifest when published by an implementing tool. This annotation is the escaped JSON object of the entire devcontainer-feature.json as it appears during the packaging stage.

An example manifest with the dev.containers.metadata annotation:

{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "config": {
    "mediaType": "application/vnd.devcontainers",
    "digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "size": 0
  },
  "layers": [
    {
      "mediaType": "application/vnd.devcontainers.layer.v1+tar",
      "digest": "sha256:738af5504b253dc6de51d2cb1556cdb7ce70ab18b2f32b0c2f12650ed6d2e4bc",
      "size": 3584,
      "annotations": {
        "org.opencontainers.image.title": "devcontainer-feature-myFeature.tgz"
      }
    }
  ],
  "annotations": {
    "dev.containers.metadata": "{\"name\": \"My Feature\",\"id\": \"myFeature\",\"version\": \"1.0.0\",\"dependsOn\": {\"ghcr.io/myotherFeature:1\": {\"flag\": true},\"features.azurecr.io/aThirdFeature:1\": {},\"features.azurecr.io/aFourthFeature:1.2.3\": {}}}"
  }
}
Directly referencing a tarball
A Feature can be referenced directly in a user’s devcontainer.json file by HTTPS URI that points to the tarball from the package step.

The .tgz archive file must be named devcontainer-feature-<featureId>.tgz.

Locally referenced Features
Instead of publishing a Feature to an OCI registry, a Feature’s source code may be referenced from a local folder. Locally referencing a Feature may be useful when first authoring a Feature.

A local Feature is referenced in the devcontainer’s feature object relative to the folder containing the project’s devcontainer.json.

Additional constraints exists when including local Features in a project:

The project must have a .devcontainer/ folder at the root of the project workspace folder.

A local Feature’s source code must be contained within a sub-folder of the .devcontainer/ folder.

The sub-folder name must match the Feature’s id field.

A local Feature may not be referenced by absolute path.

The local Feature’s sub-folder must contain at least a devcontainer-feature.json file and install.sh entrypoint script, mirroring the previously outlined file structure.

The relative path is provided using unix-style path syntax (eg ./myFeature) regardless of the host operating system.

An example project is illustrated below:

.
├── .devcontainer/
│   ├── localFeatureA/
│   │   ├── devcontainer-feature.json
│   │   ├── install.sh
│   │   └── ...
│   ├── localFeatureB/
│   │   ├── devcontainer-feature.json
│   │   ├── install.sh
│   │   └── ...
│   ├── devcontainer.json
devcontainer.json
{
        // ...
        "features": {
                "./localFeatureA": {},
                "./localFeatureB": {}
        }
}
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Dev Container Templates reference
Development Container Templates are source files packaged together that encode configuration for a complete development environment. A Template can be used in a new or existing project, and a supporting tool will use the configuration from the Template to build a development container.

The configuration is placed in a .devcontainer.json which can also reference other files within the Template. Alternatively, .devcontainer/devcontainer.json can also be used if the container needs to reference other files, such as a Dockerfile or docker-compose.yml. A Template can also provide additional source files (eg: boilerplate code or a lifecycle script).

Template metadata is captured by a devcontainer-template.json file in the root folder of the Template.

Folder Structure
A single Template is a folder with at least a devcontainer-template.json and devcontainer.json. Additional files are permitted and are packaged along side the required files.

+-- template
|    +-- devcontainer-template.json
|    +-- .devcontainer.json
|    +-- (other files)
devcontainer-template.json properties
The devcontainer-template.json file defines information about the Template to be used by any supporting tools.

The properties of the file are as follows:

Property	Type	Description
id	string	ID of the Template. The id should be unique in the context of the repository/published package where the Template exists and must match the name of the directory where the devcontainer-template.json resides.
version	string	The semantic version of the Template.
name	string	Name of the Template.
description	string	Description of the Template.
documentationURL	string	Url that points to the documentation of the Template.
licenseURL	string	Url that points to the license of the Template.
options	object	A map of options that the supporting tools should use to populate different configuration options for the Template.
platforms	array	Languages and platforms supported by the Template.
publisher	string	Name of the publisher/maintainer of the Template.
keywords	array	List of strings relevant to a user that would search for this Template.
optionalPaths	array	An array of files or directories that tooling may consider “optional” when applying a Template. Directories are indicated with a trailing /*, (eg: .github/*).
The options property
The options property contains a map of option IDs and their related configuration settings. These options are used by the supporting tools to prompt the user to choose from different Template configuration options. The tools would replace the option ID with the selected value in all the files (within the sub-directory of the Template). This replacement would happen before dropping the .devcontainer.json (or .devcontainer/devcontainer.json) and other files (within the sub-directory of the Template) required to containerize your project. See option resolution for more details. For example:

{
  "options": {
    "optionId": {
      "type": "string",
      "description": "Description of the option",
      "proposals": ["value1", "value2"],
      "default": "value1"
    }
  }
}
Property	Type	Description
optionId	string	ID of the option used by the supporting tools to replace the selected value in the files within the sub-directory of the Template.
optionId.type	string	Type of the option. Valid types are currently: boolean, string
optionId.description	string	Description for the option.
optionId.proposals	array	A list of suggested string values. Free-form values are allowed. Omit when using optionId.enum.
optionId.enum	array	A strict list of allowed string values. Free-form values are not allowed. Omit when using optionId.proposals.
optionId.default	string	Default value for the option.
Note: The options must be unique for every devcontainer-template.json

The optionalPaths property
Before applying a Template, tooling must inspect the optionalPaths property of a Template and prompt the user on whether each file or folder should be included in the resulting output workspace folder. A path is relative to the root of the Template source directory.

For a single file, provide the full relative path (without any leading or trailing path delimiters).
For a directory, provide the full relative path with a trailing slash and asterisk (/*) appended to the path. The directory and its children will be recursively ignored.
Examples are shown below:

{
    "id": "cpp",
    "version": "3.0.0",
    "name": "C++",
    "description": "Develop C++ applications",
    "optionalPaths": [
         "GETTING-STARTED.md",                 // Single file
         "example-project-1/MyProject.csproj", // Single file in nested directory
         ".github/*"                           // Entire recursive contents of directory
     ]
}
Referencing a Template
The id format (<oci-registry>/<namespace>/<template>[:<semantic-version>]) dictates how a supporting tool will locate and download a given Template from an OCI registry. For example:

ghcr.io/user/repo/go
ghcr.io/user/repo/go:1
ghcr.io/user/repo/go:latest
The registry must implement the OCI Artifact Distribution Specification. Some implementors can be found here.

Versioning
Each Template is individually versioned according to the semver specification. The version property in the respective devcontainer-template.json file is updated to increment the Template’s version.

Tooling that handles releasing Templates will not republish Templates if that exact version has already been published; however, tooling must republish major and minor versions in accordance with the semver specification.

Release
For information on distributing Templates, see the Templates distribution doc.

Option Resolution
A Template’s options property is used by a supporting tool to prompt for different configuration options. A supporting tool will parse the options object provided by the user. If a value is selected for a Template, it will be replaced in the files (within the sub-directory of the Template).

Option resolution example
Consider a java Template with the following folder structure:

+-- java
|    +-- devcontainer-template.json
|    +-- .devcontainer.json
Suppose the java Template has the following options parameters declared in the devcontainer-template.json file:

// ...
"options": {
    "imageVariant": {
        "type": "string",
        "description": "Specify version of java.",
        "proposals": [
          "17-bullseye",
          "17-buster",
          "11-bullseye",
          "11-buster",
          "17",
          "11"
        ],
    "default": "17-bullseye"
    },
    "nodeVersion": {
        "type": "string", 
        "proposals": [
          "latest",
          "16",
          "14",
          "10",
          "none"
        ],
        "default": "latest",
        "description": "Specify version of node, or 'none' to skip node installation."
    },
    "installMaven": {
        "type": "boolean", 
        "description": "Install Maven, a management tool for Java.",
        "default": "false"
    },
}
and it has the following .devcontainer.json file:

{
     "name": "Java",
     "image": "mcr.microsoft.com/devcontainers/java:0-${templateOption:imageVariant}",
     "features": {
          "ghcr.io/devcontainers/features/node:1": {
               "version": "${templateOption:nodeVersion}",
               "installMaven": "${templateOption:installMaven}"
          }
     },
//	...
}
A user tries to add the java Template to their project using the supporting tools and selects 17-bullseye when prompted for "Specify version of Go" and the default values when prompted for "Specify version of node, or 'none' to skip node installation" and "Install Maven, a management tool for Java".

The supporting tool could then use a string replacer for all the files within the sub-directory of the Template. In this example, .devcontainer.json needs to be modified and hence, the inputs can provided to it as follows:

{
  imageVariant:"17-bullseye",
  nodeVersion: "latest",
  installMaven: "false"
}
The modified .devcontainer.json will be as follows:

{
     "name": "Go",
     "image": "mcr.microsoft.com/devcontainers/go:0-17-bullseye",
     "features": {
          "ghcr.io/devcontainers/features/node:1": {
               "version": "latest",
               "installMaven": "false"
	  }
     },
     ...
}
The modified .devcontainer.json would be dropped into any existing folder as a starting point for containerizing your project.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
Dev Container Templates distribution and discovery
TL;DR Check out the quick start repository to get started on distributing your own Dev Container Templates.

This specification defines a pattern where community members and organizations can author and self-publish Dev Container Templates.

Goals include:

For Template authors, create a “self-service” way to publish a Template, either publicly or privately, that is not centrally controlled.
Provide the ability to standardize publishing such that supporting tools may implement their own mechanism to aid Template discoverability as they see fit.
Source code
A Template’s source code is stored in a git repository.

For ease of authorship and maintenance, [1..n] Templates can share a single git repository. This set of Templates is referred to as a “collection,” and will share the same devcontainer-collection.json file and “namespace” (eg. <owner>/<repo>).

Note: Templates and Features should be placed in different git repositories.

Source code for a set of Templates follows the example file structure below:

.
├── README.md
├── src
│   ├── dotnet
│   │   ├── devcontainer-template.json
│   │   ├── .devcontainer.json
│   │   ├── ...
|   ├
│   ├── docker-from-docker
│   │   ├── devcontainer-template.json
│   │   ├── .devcontainer
│   │       ├── devcontainer.json
│   │       ├── Dockerfile
│   │       └── ...
│   │   ├── ...
|   ├
│   ├── go-postgres
│   │   ├── devcontainer-template.json
│   │   ├── .devcontainer
│   │       ├── devcontainer.json
│   │       ├── docker-compose.yml
│   │       ├── Dockerfile
│   │       └── ...
│   │   ├── ...
…where src is a directory containing a sub-folder with the name of the Template (e.g. src/dotnet or src/docker-from-docker) with at least a file named devcontainer-template.json that contains the Template metadata, and a .devcontainer.json (or .devcontainer/devcontainer.json) that the supporting tools will drop into an existing project or folder.

Each sub-directory should be named such that it matches the id field of the devcontainer-template.json. Other files can also be included in the Templates’s sub-directory, and will be included during the packaging step alongside the two required files. Any files that are not part of the Templates’s sub-directory (e.g. outside of src/dotnet) will not included in the packaging step.

Versioning
Each Template is individually versioned according to the semver specification. The version property in the respective devcontainer-template.json file is parsed to determine if the Template should be republished.

Tooling that handles publishing Templates will not republish Templates if that exact version has already been published; however, tooling must republish major and minor versions in accordance with the semver specification.

Packaging
Templates are distributed as tarballs. The tarball contains the entire contents of the Template sub-directory, including the devcontainer-template.json, .devcontainer.json (or .devcontainer/devcontainer.json), and any other files in the directory.

The tarball is named devcontainer-template-<id>.tgz, where <id> is the Templates’s id field.

A reference implementation for packaging and distributing Templates is provided as a GitHub Action.

devcontainer-collection.json
The devcontainer-collection.json is an auto-generated metadata file.

Property	Type	Description
sourceInformation	object	Metadata from the implementing packaging tool.
templates	array	The list of Templates that are contained in this collection.
Each Template’s devcontainer-template.json metadata file is appended into the templates top-level array.

Distribution
There are several supported ways to distribute Templates. Distribution is handled by the implementing packaging tool such as the Dev Container CLI or Dev Container Publish GitHub Action.

A user can add a Template in to their projects as defined by the supporting tools.

OCI Registry
An OCI registry that implements the OCI Artifact Distribution Specification serves as the primary distribution mechanism for Templates.

Each packaged Template is pushed to the registry following the naming convention <registry>/<namespace>/<id>[:version], where version is the major, minor, and patch version of the Template, according to the semver specification.

Note: The namespace is a unique identifier for the collection of Templates and must be different than the collection of Features. There are no strict rules for the namespace; however, one pattern is to set namespace equal to source repository’s <owner>/<repo>.

A custom media type application/vnd.devcontainers and application/vnd.devcontainers.layer.v1+tar are used as demonstrated below.

For example, the go Template in the devcontainers/templates namespace at version 1.2.3 would be pushed to the ghcr.io OCI registry.

Note: The example below uses oras for demonstration purposes. A supporting tool should directly implement the required functionality from the aforementioned OCI artifact distribution specification.

# ghcr.io/devcontainers/templates/go:1
REGISTRY=ghcr.io
NAMESPACE=devcontainers/templates
TEMPLATE=go

ARTIFACT_PATH=devcontainer-template-go.tgz

for VERSION in 1  1.2  1.2.3  latest
do
        oras push ${REGISTRY}/${NAMESPACE}/${TEMPLATE}:${VERSION} \
                --config /dev/null:application/vnd.devcontainers \
                        ./${ARTIFACT_PATH}:application/vnd.devcontainers.layer.v1+tar
done

The “namespace” is the globally identifiable name for the collection of Templates. (eg: owner/repo for the source code’s git repository).

The auto-generated devcontainer-collection.json is pushed to the registry with the same namespace as above and no accompanying template name. The collection file is always tagged as latest.

# ghcr.io/devcontainers/templates
REGISTRY=ghcr.io
NAMESPACE=devcontainers/templates

oras push ${REGISTRY}/${NAMESPACE}:latest \
        --config /dev/null:application/vnd.devcontainers \
                            ./devcontainer-collection.json:application/vnd.devcontainers.collection.layer.v1+json
Guide to publishing Templates
The Dev Container CLI can be used to publish Template artifacts to an OCI registry (that supports the artifacts specification).

To see all the available options, run devcontainers templates publish --help.

Example
Given a directory that is organized according to the Templates distribution specification - for example:

├── src
│   ├── color
│   │   ├── devcontainer-template.json
│   │   └──| .devcontainer
│   │      └── devcontainer.json
│   ├── hello
│   │   ├── devcontainer-template.json
│   │   └──| .devcontainer
│   │      ├── devcontainer.json
│   │      └── Dockerfile
|   ├── ...
│   │   ├── devcontainer-template.json
│   │   └──| .devcontainer
│   │      └── devcontainer.json
├── test
│   ├── color
│   │   └── test.sh
│   ├── hello
│   │   └── test.sh
│   └──test-utils
│      └── test-utils.sh
...
The following command will publish each Template above (color,hello) to the registry ghcr.io with the following namespace (prefix) devcontainers/templates.

[/tmp]$  GITHUB_TOKEN="$CR_PAT" devcontainer templates publish -r ghcr.io -n devcontainers/templates ./src
To later apply a published Template (in the example below, the color template) with the CLI, the following apply command would be used:

[/tmp]$  devcontainer templates apply \
                 -t 'ghcr.io/devcontainers/templates/color' \
                 -a '{"favorite": "red"}'
Authentication Methods
NOTE: OS-specific docker credential helpers (Docker Desktop credential helper) are not currently recognized by the CLI.

Adding a $HOME/.docker/config.json with your credentials following this commonly defined format.
Your docker login command may write this file for you depending on your operating system.
Using our custom env variable DEVCONTAINERS_OCI_AUTH
eg: DEVCONTAINERS_OCI_AUTH=service1|user1|token1,service2|user2|token2
For publishing to ghcr.io

Using the devcontainers/action GitHub action to handle the GITHUB_TOKEN credential for you.
Providing a GITHUB_TOKEN with permission to write:packages.
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Specification
Reference Implementation
devcontainer.json schema
Dev Container metadata reference
Features
Features distribution
Templates
Templates distribution
Contributing
Specification
How to contribute to the Development Container Specification
We’re excited for your contributions to the Dev Container Specification! This document outlines how you can get involved. We also welcome you to join our community Slack channel.

Spec Contribution approaches
If you’d like to contribute a change or addition to the spec, you may follow the guidance below:

Propose the change via an issue in this repository. Try to get early feedback before spending too much effort formalizing it.
More formally document the proposed change in terms of properties and their semantics. Look to format your proposal like our devcontainer.json reference.
Here is a sample:

Property	Type	Description
image	string	Required when using an image. The name of an image in a container registry (DockerHub, GitHub Container Registry, Azure Container Registry) that VS Code and other devcontainer.json supporting services / tools should use to create the dev container.
PRs to the schema, i.e code or shell scripts demonstrating approaches for implementation.
Once there is discussion on your proposal, please also open and link a PR to update the devcontainer.json reference doc. When your proposal is merged, the docs will be kept up-to-date with the latest spec.

Contributing tool-specific support
Tool-specific properties are contained in namespaces in the "customizations" property. For instance, VS Code specific properties are formated as:

// Configure tool-specific properties.
"customizations": {
     // Configure properties specific to VS Code.
     "vscode": {
          // Set *default* container specific settings.json values on container create.
          "settings": {},
			
          // Additional VS Code specific properties...
     }
},
You may propose adding a new namespace for a specific tool, and any properties specific to that tool.

Formatting Guidelines
When contributing an official doc or referencing dev containers in your projects, please consider the following guidelines:

Refer to the spec as the “Development Container Specification”
All capital letters
Singular “Container” rather than plural “Containers”
The term “dev container” shouldn’t be capitalized on its own
It should only be capitalized when referring to an official tool title, like the VS Code Dev Containers extension
Signify devcontainer.json is a file type through backticks
Features and Templates should always be capitalized
Refer to the CLI as the “Dev Container CLI” (note the caps)
Use bolding for emphasis sprinkled throughout sections, rather than try to use it to always bold certain terms
Review process
We use the following labels in the spec repo:

proposal: Issues under discussion, still collecting feedback.
finalization: Proposals we intend to make part of the spec.
Milestones use a “month year” pattern (i.e. January 2022). If a finalized proposal is added to a milestone, it is intended to be merged during that milestone.

Community Engagement
There are several additional options to engage with the dev container community, such as asking questions, providing feedback, or engaging on how your team may use or contribute to dev containers:

GitHub Discussions: This is a great opportunity to connect with the community and maintainers of this project, without the requirement of contributing a change to the actual spec (which we see more in issues and PRs)
Community Slack channel: This is a great opportunity to connect with the community and maintainers
You can always check out the issues and PRs (and contribute new ones) across the repos in the Dev Containers GitHub org too!
Community collections: You can contribute your own Templates and Features to our community index!
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Supporting tools and services
This page outlines tools and services that currently support the Development Container Specification, including the devcontainer.json format. A devcontainer.json file in your project tells tools and services that support the dev container spec how to access (or create) a dev container with a well-defined tool and runtime stack.

While most dev container properties apply to any devcontainer.json supporting tool or service, a few are specific to certain tools, which are outlined below.

Editors
Visual Studio Code
Visual Studio Code specific properties go under vscode inside customizations.

"customizations": {
		// Configure properties specific to VS Code.
		"vscode": {
			// Set *default* container specific settings.json values on container create.
			"settings": {},
			"extensions": [],
		}
}
Property	Type	Description
extensions	array	An array of extension IDs that specify the extensions that should be installed inside the container when it is created. Defaults to [].
settings	object	Adds default settings.json values into a container/machine specific settings file. Defaults to {}.
Please note that the Dev Containers extension and GitHub Codespaces support these VS Code properties.

Visual Studio
Visual Studio added dev container support in Visual Studio 2022 17.4 for C++ projects using CMake Presets. It is part of the Linux and embedded development with C++ workload, so make sure it is selected in your VS installation. Visual Studio manages the lifecycle of dev containers it uses as you work, but it treats them as remote targets in a similar way to other Linux or WSL targets.

You may learn more in the announcement blog post.

IntelliJ IDEA
IntelliJ IDEA has early support dev containers that can be run remotely via an SSH connection or locally using Docker.

You may learn more in the announcement blog post.

Tools
Dev Container CLI
The Dev Container Command Line Interface (CLI) is a reference implementation for the Dev Container Spec. It is in development in the devcontainers/cli repo. It is intended both for use directly and by tools or services that want to support the spec.

The CLI can take a devcontainer.json and create and configure a dev container from it. It allows for prebuilding dev container configurations using a CI or DevOps product like GitHub Actions. It can detect and include dev container features and apply them at container runtime, and run lifecycle scripts like postCreateCommand, providing more power than a plain docker build and docker run.

VS Code extension CLI
The VS Code Dev Containers extension includes a variation of the Dev Container CLI that adds the ability use the command line to open a dev container in VS Code. It is also automatically updated when the extension updates.

Press cmd/ctrl+shift+p or F1 and select the Dev Containers: Install devcontainer CLI command to install it.

Cachix devenv
Cachix’s devenv now supports automatically generating a .devcontainer.json file. This gives you a more convenient and consistent way to use Nix with any Dev Container Spec supporting tool or service!

See devenv documentation for detais.

Jetify Devbox
Jetify (formerly jetpack.io) is a Nix-based service for deploying applications. DevBox provides a way to use Nix to generate a development environment. Jetify’s VS Code extension allows you to quickly take advantage of DevBox in any Dev Container Spec supporting tool or service.

Press cmd/ctrl+shift+p or F1 and select the Generate Dev Container files command to get started!

VS Code Dev Containers extension
The Visual Studio Code Dev Containers extension lets you use a Docker container as a full-featured development environment. It allows you to open any folder inside (or mounted into) a container and take advantage of Visual Studio Code’s full feature set. There is more information in the Dev Containers documentation.

Tip: If you make a change to your dev container after having built and connected to it, be sure to run Dev Containers: Rebuild Container from the Command Palette (cmd/ctrl+shift+p or F1) to pick up any changes you make.

Product specific properties
The Dev Containers extension implements the VS Code properties specific properties.

Product specific limitations
Some properties may also have certain limitations in the Dev Containers extension.

Property or variable	Type	Description
workspaceMount	string	Not yet supported when using Clone Repository in Container Volume.
workspaceFolder	string	Not yet supported when using Clone Repository in Container Volume.
${localWorkspaceFolder}	Any	Not yet supported when using Clone Repository in Container Volume.
${localWorkspaceFolderBasename}	Any	Not yet supported when using Clone Repository in Container Volume.
Services
GitHub Codespaces
A codespace is a development environment that’s hosted in the cloud. Codespaces run on a variety of VM-based compute options hosted by GitHub.com, which you can configure from 2 core machines up to 32 core machines. You can connect to your codespaces from the browser or locally using Visual Studio Code.

Tip: If you make a change to your dev container after having built and connected to your codespace, be sure to run Codespaces: Rebuild Container from the Command Palette (cmd/ctrl+shift+p or F1) to pick up any changes you make.

Product specific properties
GitHub Codespaces works with a growing number of tools and, where applicable, their devcontainer.json properties. For example, connecting the Codespaces web editor or VS Code enables the use of VS Code properties.

If your Codespaces project needs additional permissions for other repositories, you can configure this through the repositories and permissions properties. You may learn more about this in the Codespaces documentation. As with other tools, Codespaces specific properties are placed within a codespaces namespace inside the customizations property.

"customizations": {
	// Configure properties specific to Codespaces.
	"codespaces": {
		"repositories": {
			"my_org/my_repo": {
				"permissions": {
					"issues": "write"
				}
			}
		}
	}
}
You can customize which files are initially opened when the codespace is created:

"customizations": {
	// Configure properties specific to Codespaces.
	"codespaces": {
		"openFiles": [
			"README"
			"src/index.js"
		]
	}
}
The paths are relative to the root of the repository. They will be opened in order, with the first file activated.

Note that currently Codespaces reads these properties from devcontainer.json, not image metadata.

Product specific limitations
Some properties may apply differently to codespaces.

Property or variable	Type	Description
mounts	array	Codespaces ignores “bind” mounts with the exception of the Docker socket. Volume mounts are still allowed.
forwardPorts	array	Codespaces does not yet support the "host:port" variation of this property.
portsAttributes	object	Codespaces does not yet support the "host:port" variation of this property.
shutdownAction	enum	Does not apply to Codespaces.
${localEnv:VARIABLE_NAME}	Any	For Codespaces, the host is in the cloud rather than your local machine.
customizations.codespaces	object	Codespaces reads this property from devcontainer.json, not image metadata.
hostRequirements	object	Codespaces reads this property from devcontainer.json, not image metadata.
CodeSandbox
CodeSandbox provides cloud development environments running on a microVM architecture. VM specs start at 2 vCPUs + 2 GB RAM per environment (free tier) and can go up to 16 vCPUs + 32 GB RAM.

When you import a GitHub repository into CodeSandbox, it will automatically provision a dedicated environment for every branch. Thanks to memory snapshotting, CodeSandbox then resumes and branches an environment in under two seconds.

CodeSandbox offers support for multiple editors, so you can code using the CodeSandbox web editor, VS Code, or the CodeSandbox iOS app.

Tip: After importing a repository into CodeSandbox, you can use the built-in UI to configure the environment using dev containers.

Product specific properties
CodeSandbox has built-in support for any programming language and supports Debian and Ubuntu-based images.

All properties specific to CodeSandbox are placed within a .codesandbox folder at root level. Typically, this will contain a tasks.json file, which defines the commands to be run at startup or with a click.

More details about these can be found in the CodeSandbox documentation.

Product specific limitations
CodeSandbox runs dev containers using rootless Podman instead of Docker. CodeSandbox also uses devcontainers/cli to manage dev containers. So any limitations of rootless Podman and Dev Container CLI should apply to CodeSandbox.

The following properties apply differently to CodeSandbox.

Property or variable	Type	Description
forwardPorts	array	CodeSandbox does not need this property. All ports opened in dev containers will be mapped to a public URL automatically.
portsAttributes	object	CodeSandbox does not yet support this property. Ports are attached to tasks configured in .codesandbox/tasks.json and are attributed to the tasks.
otherPortsAttributes	object	CodeSandbox does not yet support this property.
remoteUser	string	CodeSandbox currently ignores this property and overrides this as root. CodeSandbox uses rootless Podman to run containers. Running with a non-root remote user is the same as running as a root remote user in rootless Podman, from a security perspective. CodeSandbox plans on supporting this in the future.
shutdownAction	string	Does not apply to CodeSandbox.
capAdd	array	CodeSandbox does not support adding docker capabilities. As the containers are run as a non-root user, capabilities that need root access will not work.
features	object	CodeSandbox automatically adds docker-cli to the container and connects to the host socket. Features like docker-in-docker and docker-outside-of-docker will work a bit differently. As the docker-cli and socket from host are accessible in the container, most use cases should work as expected.
${localEnv:VARIABLE_NAME}	Any	For CodeSandbox, the host is in the cloud rather than in your local machine.
hostRequirements	object	CodeSandbox does not yet support this property.
DevPod
DevPod is a client-only tool to create reproducible developer environments based on a devcontainer.json on any backend. Each developer environment runs in a container and is specified through a devcontainer.json. Through DevPod providers these environments can be created on any backend, such as the local computer, a Kubernetes cluster, any reachable remote machine or in a VM in the cloud.

Gitpod
Gitpod Flex is a platform for automating and standardizing development environments. Available as a self-hosted solution in your cloud or for local development through Gitpod Desktop, Gitpod Flex scales to support environments with up to 896 vCPUs and 12TB of RAM, including GPU support and compatibility with multiple editors like VS Code, JetBrains, Cursor, and Zed.

Gitpod Flex fully adheres to the Dev Container Specification, enabling developers to create portable and reproducible environments through devcontainer.json. To apply changes, simply run gitpod environment devcontainer rebuild from within any development environment.

For more details on constraints, customizations, and automation options, please refer to the blog announcement.

Schema
You can explore the VS Code implementation of the dev container schema.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
General Availability of Dependabot Integration
23 Jan 2024 - @joshspicer

We are excited to announce that starting today, in collaboration with the Dependabot Team, the devcontainers package ecosystem is now generally available! Dependabot will now be able to update your public Dev Container Features, keeping them up-to-date with the latest published versions.

To opt-in, add a .github/dependabot.yml to a repository containing one or more devcontainer.json configuration files:

# To get started with Dependabot version updates, you'll need to specify which
# package ecosystems to update and where the package manifests are located.
# Please see the documentation for all configuration options:
# https://docs.github.com/github/administering-a-repository/configuration-options-for-dependency-updates

version: 2
updates:
  - package-ecosystem: "devcontainers" # See documentation for possible values
    directory: "/"
    schedule:
      interval: weekly
Once configured, Dependabot will begin to create pull requests to update your Dev Container Features:

Dependabot PR
An example diff generated by Dependabot is shown below:

---
 .devcontainer-lock.json              | 8 ++++----
 .devcontainer.json                   | 2 +-
 2 files changed, 5 insertions(+), 5 deletions(-)

diff --git a/.devcontainer-lock.json b/.devcontainer-lock.json
index 324582b..a3868d9 100644
--- a/.devcontainer-lock.json
+++ b/.devcontainer-lock.json
@@ -1,9 +1,9 @@
 {
   "features": {
-    "ghcr.io/devcontainers/features/docker-in-docker:1": {
-      "version": "1.0.9",
-      "resolved": "ghcr.io/devcontainers/features/docker-in-docker@sha256:b4c04ba88371a8ec01486356cce10eb9fe8274627d8d170aaec87ed0d333080d",
-      "integrity": "sha256:b4c04ba88371a8ec01486356cce10eb9fe8274627d8d170aaec87ed0d333080d"
+    "ghcr.io/devcontainers/features/docker-in-docker:2": {
+      "version": "2.7.1",
+      "resolved": "ghcr.io/devcontainers/features/docker-in-docker@sha256:f6a73ee06601d703db7d95d03e415cab229e78df92bb5002e8559bcfc047fec6",
+      "integrity": "sha256:f6a73ee06601d703db7d95d03e415cab229e78df92bb5002e8559bcfc047fec6"
     }
   }
 }
\ No newline at end of file
diff --git a/.devcontainer.json b/.devcontainer.json
index e9d9af5..9eb9165 100644
--- a/.devcontainer.json
+++ b/.devcontainer.json
@@ -1,6 +1,6 @@
 {
     "image": "mcr.microsoft.com/devcontainers/base:jammy",
     "features": {
-        "ghcr.io/devcontainers/features/docker-in-docker:1": {}
+        "ghcr.io/devcontainers/features/docker-in-docker:2": {}
     }
 }
This updater ensures publicly-accessible Features are pinned to the latest version in the associated devcontainer.json file. If a dev container has an associated lockfile, that file will also be updated. For more information on lockfiles, see this specification.

Features in any valid dev container location will be updated in a single pull request.

Dependabot version updates are free to use for all repositories on GitHub.com. For more information see the Dependabot version update documentation.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Speed Up Your Workflow with Prebuilds
22 Aug 2023 - @bamurtaugh @craiglpeters

Getting dev containers up and running for your projects is exciting - you’ve unlocked environments that include all the dependencies your projects need to run, and you can spend so much more time on coding rather than configuration.

Once your dev container has everything it needs, you might start thinking more about ways to optimize it. For instance, it might take a while to build. Maybe it takes 5 minutes. Maybe it takes an hour!

You can get back to working fast and productively after that initial container build, but what if you need to work on another machine and build the container again? Or what if some of your teammates want to use the container on their machines and will need to build it too? It’d be great to make the build time faster for everyone, every time.

After configuring your dev container, a great next step is to prebuild your image.

In this guide, we’ll explore what it means to prebuild an image and the benefits of doing so, such as speeding up your workflow, simplifying your environment, and pinning to specific versions of tools.

We have a variety of tools designed to help you with prebuilds. In this guide, we’ll explore two different repos as examples of how our team uses different combinations of these tools:

The prebuilt image for the Kubernetes repo developed by one of our spec maintainers Craig
The prebuilt images we host in the devcontainers/images repo as part of the dev container spec
What is prebuilding?
We should first define: What is prebuilding?

If you’re already using dev containers, you’re likely already familiar with the idea of building a container, where you package everything your app needs to run into a single unit.

You need to build your container once it has all the dependencies it needs, and rebuild anytime you add new dependencies. Since you may not need to rebuild often, it might be alright if it takes a while for that initial build. But if you or your teammates need to use that container on another machine, you’ll need to wait for it to build again in those new environments.

Note: The dev container CLI doc is another great resource on prebuilding.

Prebuilt Codespaces
You may have heard (or will hear about) GitHub Codespaces prebuilds. Codespaces prebuilds are similar to prebuilt container images, with some additional focus on the other code in your repo.

GitHub Codespaces prebuilds help to speed up the creation of new codespaces for large or complex repositories. A prebuild assembles the main components of a codespace for a particular combination of repository, branch, and devcontainer.json file.

By default, whenever you push changes to your repository, GitHub Codespaces uses GitHub Actions to automatically update your prebuilds.

You can learn more about codespaces prebuilds and how to manage them in the codespaces docs.

How do I prebuild my image?
We try to make prebuilding an image and using a prebuilt image as easy as possible. Let’s walk through the couple of steps to get started.

Prebuilding an image:

Install the Dev Container CLI:

   npm install -g @devcontainers/cli
Build your image and push it to a container registry (like the Azure Container Registry, GitHub Container Registry, or Docker Hub):

   devcontainer build --workspace-folder . --push true --image-name <my_image_name>:<optional_image_version>
You can automate pre-building your image by scheduling the build using a DevOps or continuous integration (CI) service like GitHub Actions. We’ve created a GitHub Action and Azure DevOps task to help with this.

Using a prebuilt image:

Determine the published URL of the prebuilt image you want to use
Reference it in your devcontainer.json, Dockerfile, or Docker Compose file
In our previous guide on “Using Images, Dockerfiles, and Docker Compose,” we also showed how you can use prebuilt images, Dockerfiles, or Docker Compose files for your configurations
Prebuild Examples
As mentioned above, let’s walk through a couple examples of these steps, one using Craig’s Kubernetes repo, and the other using our devcontainers/images repo.

Kubernetes

It’s a fork of the main Kubernetes repo and contributes a prebuilt dev container for use in the main Kubernetes repo or any other forks
The dev container it’s prebuilding is defined in the .github/.devcontainer folder
Any time a change is made to the dev container, the repo currently uses the dev container GitHub Action to build the image and push it to GHCR
You can check out its latest prebuilt image in the Packages tab of its GitHub Repo. In this tab, you can see its GHCR URL is ghcr.io/craiglpeters/kubernetes-devcontainer:latest
The main Kubernetes repo and any fork of it can now define a .devcontainer folder and reference this prebuilt image through: "image": "ghcr.io/craiglpeters/kubernetes-devcontainer:latest"
Dev container spec images

This repo prebuilds a variety of dev containers, each of which is defined in their individual folders in the src folder
As an example, the Python image is defined in the src/python/.devcontainer folder
Any time a change is made to the dev container, the repo uses a GitHub Action to build the image and push it to MCR
Using the Python image as an example again, its MCR URL is mcr.microsoft.com/devcontainers/python
Any projects can now reference this prebuilt image through: "image": "mcr.microsoft.com/devcontainers/python"
Where do the dependencies come from?
If your devcontainer.json is as simple as just an image property referencing a prebuilt image, you may wonder: How can I tell what dependencies will be installed for my project? And how can I modify them?

Let’s walk through the Kubernetes prebuild as an example of how you can determine which dependencies are installed and where:

Start at your end user dev container
We start at the .devcontainer/devcontainer.json designed for end use in the Kubernetes repo and other forks of it
It sets a few properties, such as hostRequirements, onCreateCommand, and otherPortsAttributes
We see it references a prebuilt image, which will include dependencies that don’t need to be explicitly mentioned in this end user dev container. Let’s next go explore the dev container defining this prebuilt image
Explore the dev container defining your prebuilt image
We next open the config that defines the prebuilt image. This is contained in the .github/.devcontainer folder
We see there’s a devcontainer.json. It’s much more detailed than the end user dev container we explored above and includes a variety of Features
Explore content in the prebuilt dev container’s config
Each Feature defines additional functionality
We can explore what each of them installs in their associated repo. Most appear to be defined in the devcontainers/features repo as part of the dev container spec
Modify and rebuild as desired
If I’d like to add more content to my dev container, I can either modify my end user dev container (i.e. the one designed for the main Kubernetes repo), or modify the config defining the prebuilt image (i.e. the content in Craig’s dev container)
For universal changes that anyone using the prebuilt image should get, update the prebuilt image
For more project or user specific changes (i.e. a language I need in my project but other forks won’t necessarily need, or user settings I prefer for my editor environment), update the end user dev container
Features are a great way to add dependencies in a clear, easily packaged way
Benefits
There are a variety of benefits (some of which we’ve already explored) to creating and using prebuilt images:

Faster container startup
Pull an already built dev container config rather than having to build it freshly on any new machine
Simpler configuration
Your devcontainer.json can be as simple as just an image property
Pin to a specific version of tools
This can improve supply-chain security and avoid breaks
Tips and Tricks
We explored the prebuilt images we host as part of the spec in devcontainers/images. These can form a great base for other dev containers you’d like to create for more complex scenarios
The spec has a concept of Development container “Templates” which are source files packaged together that encode configuration for a complete development environment
A Template may be as simple as a devcontainer.json referencing a prebuilt image, and a devcontainer-template.json
You can learn more about Templates in our Templates documentation
You can adopt and iterate on existing Templates from the spec and community, or you can create and share your own
You can include Dev Container configuration and Feature metadata in prebuilt images via image labels. This makes the image self-contained since these settings are automatically picked up when the image is referenced - whether directly, in a FROM in a referenced Dockerfile, or in a Docker Compose file. You can learn more in our reference docs
You can use multi-stage Dockerfiles to create a prod container from your dev container
You’d typically start with your prod image, then add to it
Features provide a quick way to add development and CI specific layers that you wouldn’t use in production
For more information and an example, check out our discussion on multi-stage builds
Feedback and Closing
We hope this guide will help you optimize your dev container workflows! We can’t wait to hear your tips, tricks, and feedback. How are you prebuilding your images? Would anything in the spec or tooling make the process easier for you?

If you haven’t already, we recommend joining our dev container community Slack channel where you can connect with the dev container spec maintainers and community at large. If you have any feature requests or experience any issues as you use the above tools, please feel free to also open an issue in the corresponding repo in the dev containers org on GitHub.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Best Practices: Authoring a Dev Container Feature
14 Jun 2023 - @joshspicer

Last November I wrote about the basics around authoring a Dev Container Feature. Since then, hundreds of Features have been written by the community. The flexibility of Features has enabled a wide variety of use cases, from installing a single tool to setting up specific aspects of a project’s development environment that can be shared across repositories. To that effect, many different patterns for Feature authorship have emerged, and the core team has learned a lot about what works well and what doesn’t.

Utilize the test command
Bundled with the devcontainer cli is the devcontainer features test command. This command is designed to help Feature authors test their Feature in a variety of scenarios. It is highly recommended that Feature authors use this command to test their Feature before publishing. Some documentation on the test command can be found here, and an example can be found in the Feature quick start repo. This repo is updated periodically as new functionality is added to the reference implementation.

Feature idempotency
The most useful Features are idempotent. This means that if a Feature is installed multiple times with different options (something that will come into play with Feature Dependencies), the Feature should be able to handle this gracefully. This is especially important for option-rich Features that you anticipate others may depend on in the future.

🔧 There is an open spec proposal for installing the same Feature twice in a given devcontainer.json (devcontainers/spec#44). While the syntax to do so in a given devcontainer.json is not yet defined, Feature dependencies will effectively allow for this.

For Features that install a versioned tool (eg: version x of go and version y of ruby ), a robust Feature should be able to install multiple versions of the tool. If your tool has a version manager (java’s SDKMAN, ruby’s rvm) it is usually as simple as installing the version manager and then running a command to install the desired version of that tool.

For instances where there isn’t an existing version manager available, a well-designed Feature should consider installing distict versions of itself to a well known location. A pattern that many Features utilize successfully is writing each version of each tool to a central folder and symlinking the “active” version to a folder on the PATH.

Features can redefine the PATH variable with containerEnv, like so:

# devcontainer-feature.json
"containerEnv": {
    "PATH": "/usr/local/myTool/bin:${PATH}"
}
🔧 A spec proposal is open for simplifying the process of adding a path to the $PATH variable: (devcontainers/spec#251).

To make testing for idempotency easy, this change to the reference implementation introduces a new mode to the devcontainer features test command that will attempt to install a Feature multiple times. This is useful for testing that a Feature is idempotent, and also for testing that a Feature is able to logically “juggle” multiple versions of a tool.

Writing your install script
🔧 Many of the suggestions in this section may benefit from the Feature library/code reuse proposal.

This section includes some tips for the contents of the install.sh entrypoint script.

Detect Platform/OS
🔧 A spec proposal is open for detecting the platform/OS and providing better warnings (devcontainers/spec#58).

Features are often designed to work on a subset of possible base images. For example, the majority of Features in the devcontainers/features repo are designed to work broadly with debian-derived images. The limitation is often simply due to the wide array of base images available, and the fact that many Features will use an OS-specific package manager. To make it easy for users to understand which base images a Feature is designed to work with, it is recommended that Features include a check for the OS and provide a helpful error message if the OS is not supported.

One possible way to implement this check is shown below.

# Source /etc/os-release to get OS info
# Looks something like:
#     PRETTY_NAME="Debian GNU/Linux 11 (bullseye)"
#     NAME="Debian GNU/Linux"
#     VERSION_ID="11"
#     VERSION="11 (bullseye)"
#     VERSION_CODENAME=bullseye
#     ID=debian
#     HOME_URL="https://www.debian.org/"
#     SUPPORT_URL="https://www.debian.org/support"
#     BUG_REPORT_URL="https://bugs.debian.org/"
. /etc/os-release
# Store host architecture
architecture="$(dpkg --print-architecture)"

DOCKER_MOBY_ARCHIVE_VERSION_CODENAMES="buster bullseye focal bionic xenial"
if [[ "${DOCKER_MOBY_ARCHIVE_VERSION_CODENAMES}" != *"${VERSION_CODENAME}"* ]]; then
    print_error "Unsupported  distribution version '${VERSION_CODENAME}'. To resolve, either: (1) set feature option '\"moby\": false' , or (2) choose a compatible OS distribution"
    print_error "Supported distributions include:  ${DOCKER_MOBY_ARCHIVE_VERSION_CODENAMES}"
    exit 1
fi
If you are targeting distros that may not have your desired scripting language installed (eg: bash is often not installed on alpine images), you can either use plain /bin/sh - which is available virtually everywhere - or you can verify (and install) the scripting language in a small bootstrap script as shown below.

#!/bin/sh 

# ... 
# ...

if [ "$(id -u)" -ne 0 ]; then
    echo -e 'Script must be run as root. Use sudo, su, or add "USER root" to your Dockerfile before running this script.'
    exit 1
fi

# If we're using Alpine, install bash before executing
. /etc/os-release
if [ "${ID}" = "alpine" ]; then
    apk add --no-cache bash
fi

exec /bin/bash "$(dirname $0)/main.sh" "$@"
exit $?
Validating functionality against several base images can be done by using the devcontainer features test command with the --base-image flag, or with a scenario. For example, one could add a workflow like this to their repo.

name: "Test Features matrixed with a set of base images"
on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    continue-on-error: true
    strategy:
      matrix:
        features: [
            "anaconda",
            "aws-cli",
            "azure-cli",
            # ...
        ]
        baseImage:
          [
            "ubuntu:bionic",
            "ubuntu:focal",
            "ubuntu:jammy",
            "debian:11",
            "debian:12",
            "mcr.microsoft.com/devcontainers/base:ubuntu",
            "mcr.microsoft.com/devcontainers/base:debian",
          ]
    steps:
      - uses: actions/checkout@v3

      - name: "Install latest devcontainer CLI"
        run: npm install -g @devcontainers/cli
        
      - name: "Generating tests for '${{ matrix.features }}' against '${{ matrix.baseImage }}'"
        run: devcontainer features test  --skip-scenarios -f ${{ matrix.features }} -i ${{ matrix.baseImage }}
         
Detect the non-root user
Feature installation scripts are run as root. In contrast, many dev containers have a remoteUser set (either implicitly through image metadata or directly in the devcontainer.json). In a Feature’s installation script, one should be mindful of the final user and account for instances where the user is not root.

Feature authors should take advantage of the _REMOTE_USER and similar variables injected during the build.

# Install tool in effective remoteUser's bin folder
mkdir -p "$_REMOTE_USER_HOME/bin"
curl $TOOL_DOWNLOAD_LINK -o "$_REMOTE_USER_HOME/bin/$TOOL"
chown $_REMOTE_USER:$_REMOTE_USER "$_REMOTE_USER_HOME/bin/$TOOL"
chmod 755 "$_REMOTE_USER_HOME/bin/$TOOL"
Implement redundant paths/strategies
Most Features in the index today have some external/upstream dependency. Very often these upstream dependencies can change (ie: versioning pattern, rotated GPG key, etc…) that may cause a Feature to fail to install. To mitigate this, one strategy is to implement multiple paths to install a given tool (if available). For example, a Feature that installs go might try to install it from the upstream package manager, and if not fall back to a GitHub release.

Writing several scenario tests that force the Feature to go down distinct installation paths will help you catch cases where a given path no longer works.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Working with GitLab CI
15 Feb 2023 - @raginjason

For simple use cases you can use your development container (dev container) for CI without much issue. Once you begin using more advanced dev container functionality such as Features, you will need dev container tooling in your CI pipeline. While GitHub CI has the devcontainers-ci GitHub Action, there is no such analog in GitLab CI. To achieve the goal of using your dev container in GitLab CI, the container must be pre-built.

This document will guide you on how to build a dev container with GitLab CI, push that dev container to the GitLab Container Registry, and finally reference that dev container in your main project for both local development and GitLab CI.

For the purpose of this document, we will assume the main project is named my-project and lives under the my-user path. The example here uses a few Features, which is what forces the container to be pre-built.

The Development Container GitLab project
Create a project in GitLab where the stand-alone dev container project will live. As the main project is assumed to be named my-project, let’s assume the dev container project name will be my-project-dev-container

Development Container .devcontainer/devcontainer.json
The example here is a CDK project for Python makes use of both the AWS CLI and the community-maintained AWS CDK Features.

.devcontainer/devcontainer.json:

{
  "build": {
    "context": "..",
    "dockerfile": "Dockerfile"
  },
  "features": {
    "ghcr.io/devcontainers/features/aws-cli:1": {},
    "ghcr.io/devcontainers-contrib/features/aws-cdk:2": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "python.formatting.provider": "black"
      }
    }
  }
}
Development Container Dockerfile
As this is a Python project working with CDK, the Dockerfile will begin by using the latest Python dev container image and then install some basic packages via pip.

Dockerfile:

FROM mcr.microsoft.com/devcontainers/python:latest

RUN pip3 --disable-pip-version-check --no-cache-dir install aws_cdk_lib constructs jsii pylint \
    && rm -rf /tmp/pip-tmp
Development Container .gitlab-ci.yml
Since there is no GitLab CI equivalent to devcontainers-ci GitHub Action, we will need to install the devcontainers CLI manually. The following will:

Install the packages that the devcontainers CLI requires
Install the devcontainers CLI itself
Login to GitLab Container Repository
Build the dev container and push it to the GitLab Container Repository
.gitlab-ci.yml:

image: docker:latest

variables:
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:dind

before_script:
  - apk add --update nodejs npm python3 make g++
  - npm install -g @devcontainers/cli

build:
  stage: build
  script:
    - docker login -u gitlab-ci-token -p ${CI_JOB_TOKEN} ${CI_REGISTRY}
    - devcontainer build --workspace-folder . --push true --image-name ${CI_REGISTRY_IMAGE}:latest
The Main GitLab project
Main .devcontainer/devcontainer.json
.devcontainer/devcontainer.json:

{
  "image": "registry.gitlab.com/my-user/my-project-dev-container"
}
Main .gitlab.ci.yml
Assuming the dev container project name is based off the main project name, the ${CI_REGISTRY_NAME} variable can be used. This configuration performs some basic sanity checks and linting once merge requests are submitted.

.gitlab-ci.json:

image: ${CI_REGISTRY_IMAGE}-dev-container:latest

before_script:
  - python --version
  - cdk --version

stages:
  - Build
  - Lint

py_compile:
  stage: Build
  script:
    - find . -type f -name "*.py" -print | xargs -n1 python3 -m py_compile
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

cdk synth:
  stage: Build
  script:
    - JSII_DEPRECATED=fail cdk --app "python3 app.py" synth
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

Pylint:
  stage: Lint
  script:
    - pylint *
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

Black code format:
  stage: Lint
  script:
    - black --check --diff .
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
Conclusion
It’s worth noting that the best practice would be to pin the versions of the various packages installed by pip, apk, npm and the like. Version pinning was omitted from this guide so that it can be executed as-is without issue.

The above provides a starting point for a dev container that’s used for both local development and in GitLab CI. It can easily be customized for other languages and tool chains. Take it and make it your own, happy coding!

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Using Images, Dockerfiles, and Docker Compose
16 Dec 2022 - @chuxel

When creating a development container, you have a variety of different ways to customize your environment like “Features” or lifecycle scripts. However, if you are familiar with containers, you may want to use a Dockerfile or Docker Compose / Compose to customize your environment. This article will walk through how to use these formats with the Dev Container spec.

Using a Dockerfile
To keep things simple, many Dev Container Templates use container image references.

{
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu"
}
However, Dockerfiles are a great way to extend images, add additional native OS packages, or make minor edits to the OS image. You can reuse any Dockerfile, but let’s walk through how to create one from scratch.

First, add a file named Dockerfile next to your devcontainer.json. For example:

FROM mcr.microsoft.com/devcontainers/base:ubuntu
# Install the xz-utils package
RUN apt-get update && apt-get install -y xz-utils
Next, remove the image property from devcontainer.json (if it exists) and add the build and dockerfile properties instead:

{
    "build": {
        // Path is relative to the devcontainer.json file.
        "dockerfile": "Dockerfile"
    }
}
That’s it! When you start up your Dev Container, the Dockerfile will be automatically built with no additional work. See Dockerfile scenario reference for more information on other related devcontainer.json properties.

Iterating on an image that includes Dev Container metadata
Better yet, you can can use a Dockerfile as a part of authoring an image you can share with others. You can even add Dev Container settings and metadata right into the image itself. This avoids having to duplicate config and settings in multiple devcontainer.json files and keeps them in sync with your images!

See the guide on pre-building to learn more!

Using Docker Compose
Docker Compose is a great way to define a multi-container development environment. Rather than adding things like databases or redis to your Dockerfile, you can reference existing images for these services and focus your Dev Container’s content on tools and utilities you need for development.

Using an image with Docker Compose
As mentioned in the Dockerfile section, to keep things simple, many Dev Container Templates use container image references.

{
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu"
}
Let’s create a docker-compose.yml file next to your devcontainer.json that references the same image and includes a PostgreSQL database:

version: '3.8'
services:
  devcontainer:
    image: mcr.microsoft.com/devcontainers/base:ubuntu
    volumes:
      - ../..:/workspaces:cached
    network_mode: service:db
    command: sleep infinity

  db:
    image: postgres:latest
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres

volumes:
  postgres-data:
In this example:

../..:/workspaces:cached mounts the workspace folder from the local source tree into the Dev Container.
network_mode: service:db puts the Dev Container on the same network as the database, so that it can access it on localhost.
The db section uses the Postgres image with a few settings.
Next, let’s configure devcontainer.json to use it.

{
    "dockerComposeFile": "docker-compose.yml",
    "service": "devcontainer",
    "workspaceFolder": "/workspaces/${localWorkspaceFolderBasename}"
}
In this example:

service indicates which service in the docker-compose.yml file is the Dev Container.
dockerComposeFile indicates where to find the docker-compose.yml file.
workspaceFolder indicates where to mount the workspace folder. This corresponds to a sub-folder under the mount point from ../..:/workspaces:cached in the docker-compose.yml file.
That’s it!

Using a Dockerfile with Docker Compose
You can also combine these scenarios and use Dockerfile with Docker Compose. This time we’ll update docker-compose.yml to reference the Dockerfile by replacing image with a similar build section:

version: '3.8'
services:
  devcontainer:
    build: 
      context: .
      dockerfile: Dockerfile
    volumes:
      - ../..:/workspaces:cached      
    network_mode: service:db
    command: sleep infinity

  db:
    image: postgres:latest
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres

volumes:
  postgres-data:
Finally, as in the Dockerfile example, you can use this same setup to create a Dev Container image that you can share with others. You can also add Dev Container settings and metadata right into the image itself.

See the guide on pre-building to learn more!

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Authoring a Dev Container Feature
01 Nov 2022 - @joshspicer

Development container “Features” are self-contained, shareable units of installation code and development container configuration. We define a pattern for authoring and self-publishing Features.

In this document, we’ll outline a “quickstart” to help you get up-and-running with creating and sharing your first Feature. You may review an example along with guidance in our devcontainers/feature-starter repo as well.

Note: While this walkthrough will illustrate the use of GitHub and the GitHub Container Registry, you can use your own source control system and publish to any OCI Artifact supporting container registry instead.

Create a repo
Start off by creating a repository to host your Feature. In this guide, we’ll use a public GitHub repository.

For the simplest getting started experience, you may use our example feature-starter repo. You may select the green Use this template button on the repo’s page.

You may also create your own repo on GitHub if you’d prefer.

Create a folder
Once you’ve forked the feature-starter repo (or created your own), you’ll want to create a folder for your Feature. You may create one within the src folder.

If you’d like to create multiple Features, you may add multiple folders within src.

Add files
At a minimum, a Feature will include a devcontainer-feature.json and an install.sh entrypoint script.

There are many possible properties for devcontainer-feature.json, which you may review in the Features spec.

Below is a hello world example devcontainer-feature.json and install.sh. You may review the devcontainers/features repo for more examples.

devcontainer-feature.json:

{
    "name": "Hello, World!",
    "id": "hello",
    "version": "1.0.2",
    "description": "A hello world feature",
    "options": {
        "greeting": {
            "type": "string",
            "proposals": [
                "hey",
                "hello",
                "hi",
                "howdy"
            ],
            "default": "hey",
            "description": "Select a pre-made greeting, or enter your own"
        }
    }
}
install.sh:

#!/bin/sh
set -e

echo "Activating feature 'hello'"

GREETING=${GREETING:-undefined}
echo "The provided greeting is: $GREETING"

cat > /usr/local/bin/hello \
<< EOF
#!/bin/sh
RED='\033[0;91m'
NC='\033[0m' # No Color
echo "\${RED}${GREETING}, \$(whoami)!\${NC}"
EOF

chmod +x /usr/local/bin/hello
Publishing
The feature-starter repo contains a GitHub Action workflow that will publish each feature to GHCR. By default, each feature will be prefixed with the <owner/<repo> namespace. Using the hello world example from above, it can be referenced in a devcontainer.json with: ghcr.io/devcontainers/feature-starter/color:1.

Note: You can use the devcontainer features publish command from the Dev Container CLI if you are not using GitHub Actions.

The provided GitHub Action will also publish a third “metadata” package with just the namespace, eg: `ghcr.io/devcontainers/feature-starter. This is useful for supporting tools to crawl metadata about available Features in the collection without downloading all the Features individually.

By default, GHCR packages are marked as private. To stay within the free tier, Features need to be marked as public.

This can be done by navigating to the Feature’s “package settings” page in GHCR, and setting the visibility to public. The URL may look something like:

https://github.com/users/<owner>/packages/container/<repo>%2F<featureName>/settings
Changing package visibility to public

Adding Features to the Index
If you’d like your Features to appear in our public index so that other community members can find them, you can do the following:

Go to github.com/devcontainers/devcontainers.github.io, which is the GitHub repo backing containers.dev
Open a PR to modify the collection-index.yml file
Features housed in other OCI Artifact container registries can be included as long as they can be downloaded without a login.
Feature collections are scanned to populate a Feature index on the containers.dev site and allow them to appear in Dev Container creation UX in supporting tools like VS Code Dev Containers and GitHub Codespaces.

 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Available Dev Container Features
This table contains all official and community-supported Dev Container Features known at the time of crawling each registered collection. This list is continuously updated with the latest available feature information. See the Feature quick start repository to add your own!

Referencing a Feature below can be done in the "features" section of a devcontainer.json.

Please note that if you need to report a Feature, you should do so through the registry hosting the Feature.

To add your own collection to this list, please create a PR editing this yaml file.

Search


Feature Name	Maintainer	Reference	Latest Version
Anaconda	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/anaconda:1	1.0.13
AWS CLI	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/aws-cli:1	1.1.2
Azure CLI	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/azure-cli:1	1.2.7
Common Utilities	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/common-utils:2	2.5.3
Conda	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/conda:1	1.0.10
Light-weight Desktop	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/desktop-lite:1	1.2.6
Docker (Docker-in-Docker)	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/docker-in-docker:2	2.12.2
Docker (docker-outside-of-docker)	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/docker-outside-of-docker:1	1.6.3
Dotnet CLI	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/dotnet:2	2.3.0
Git (from source)	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/git:1	1.3.4
Git Large File Support (LFS)	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/git-lfs:1	1.2.5
GitHub CLI	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/github-cli:1	1.0.14
Go	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/go:1	1.3.2
Hugo	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/hugo:1	1.1.3
Java (via SDKMAN!)	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/java:1	1.6.3
Kubectl, Helm, and Minikube	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/kubectl-helm-minikube:1	1.2.2
Nix Package Manager	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/nix:1	1.3.1
Node.js (via nvm), yarn and pnpm	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/node:1	1.6.3
NVIDIA CUDA	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/nvidia-cuda:1	1.2.1
Oryx	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/oryx:1	1.4.1
PHP	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/php:1	1.1.4
PowerShell	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/powershell:1	1.5.1
Python	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/python:1	1.7.1
Ruby (via rvm)	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/ruby:1	1.3.1
Rust	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/rust:1	1.3.3
SSH server	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/sshd:1	1.0.10
Terraform, tflint, and TFGrunt	Dev Container Spec Maintainers	ghcr.io/devcontainers/features/terraform:1	1.4.0
Data Version Control	Iterative, Inc	ghcr.io/iterative/features/dvc:1	1.0.4
nvtop - GPUs Process monitoring	Iterative, Inc	ghcr.io/iterative/features/nvtop:1	1.0.0
apt packages	Rocker Project	ghcr.io/rocker-org/devcontainer-features/apt-packages:1	1.0.2
Conda, Mamba (Miniforge)	Rocker Project	ghcr.io/rocker-org/devcontainer-features/miniforge:2	2.0.1
Pandoc	Rocker Project	ghcr.io/rocker-org/devcontainer-features/pandoc:1	1.0.0
Quarto CLI	Rocker Project	ghcr.io/rocker-org/devcontainer-features/quarto-cli:1	1.1.4
R (via apt)	Rocker Project	ghcr.io/rocker-org/devcontainer-features/r-apt:0	0.5.0
R packages from the DESCRIPTION file (via pak)	Rocker Project	ghcr.io/rocker-org/devcontainer-features/r-dependent-packages:0	0.2.0
R history	Rocker Project	ghcr.io/rocker-org/devcontainer-features/r-history:0	0.1.0
R packages (via pak)	Rocker Project	ghcr.io/rocker-org/devcontainer-features/r-packages:1	1.1.0
R (via rig)	Rocker Project	ghcr.io/rocker-org/devcontainer-features/r-rig:1	1.2.4
renv cache	Rocker Project	ghcr.io/rocker-org/devcontainer-features/renv-cache:0	0.1.2
RStudio Server	Rocker Project	ghcr.io/rocker-org/devcontainer-features/rstudio-server:0	0.3.1
fish	Meaningful	ghcr.io/meaningful-ooo/devcontainer-features/fish:2	2.0.0
Homebrew	Meaningful	ghcr.io/meaningful-ooo/devcontainer-features/homebrew:2	2.0.4
Fastly	Mike Priscella	ghcr.io/mpriscella/features/fastly:1	1.0.1
Helm Chart Testing	Mike Priscella	ghcr.io/mpriscella/features/helm-chart-testing:1	1.0.0
Kind	Mike Priscella	ghcr.io/mpriscella/features/kind:1	1.0.1
Sops	Mike Priscella	ghcr.io/mpriscella/features/sops:1	1.0.2
DuckDB CLI	eitsupi	ghcr.io/eitsupi/devcontainer-features/duckdb-cli:1	1.1.1
Task	eitsupi	ghcr.io/eitsupi/devcontainer-features/go-task:1	1.0.4
jq, yq, gojq, xq, jaq	eitsupi	ghcr.io/eitsupi/devcontainer-features/jq-likes:2	2.1.1
mdBook	eitsupi	ghcr.io/eitsupi/devcontainer-features/mdbook:1	1.0.0
Nushell	eitsupi	ghcr.io/eitsupi/devcontainer-features/nushell:0	0.1.1
act	Eric Ho	ghcr.io/dhoeric/features/act:1	1.0.0
aztfy	Eric Ho	ghcr.io/dhoeric/features/aztfy:1	1.0.0
Conftest	Eric Ho	ghcr.io/dhoeric/features/conftest:1	1.0.0
Fly.io CLI	Eric Ho	ghcr.io/dhoeric/features/flyctl:1	1.0.0
Google Cloud CLI	Eric Ho	ghcr.io/dhoeric/features/google-cloud-cli:1	1.0.1
hadolint	Eric Ho	ghcr.io/dhoeric/features/hadolint:1	1.0.0
k6	Eric Ho	ghcr.io/dhoeric/features/k6:1	1.0.0
k9s-cli	Eric Ho	ghcr.io/dhoeric/features/k9s:1	1.0.1
mizu	Eric Ho	ghcr.io/dhoeric/features/mizu:1	1.0.0
Open Policy Agent	Eric Ho	ghcr.io/dhoeric/features/opa:1	1.0.0
oras-cli	Eric Ho	ghcr.io/dhoeric/features/oras:1	1.0.0
stern	Eric Ho	ghcr.io/dhoeric/features/stern:1	1.0.0
terraform-docs	Eric Ho	ghcr.io/dhoeric/features/terraform-docs:1	1.0.0
terraformer	Eric Ho	ghcr.io/dhoeric/features/terraformer:1	1.0.0
tfsec	Eric Ho	ghcr.io/dhoeric/features/tfsec:1	1.0.0
trivy	Eric Ho	ghcr.io/dhoeric/features/trivy:1	1.0.0
Azure Bicep	Ravikanth Chaganti	ghcr.io/rchaganti/vsc-devcontainer-features/azurebicep:1	1.0.5
cosign	Ravikanth Chaganti	ghcr.io/rchaganti/vsc-devcontainer-features/cosign:1	1.0.1
CUE Lang	Ravikanth Chaganti	ghcr.io/rchaganti/vsc-devcontainer-features/cuelang:1	1.0.5
gitsign	Ravikanth Chaganti	ghcr.io/rchaganti/vsc-devcontainer-features/gitsign:1	1.0.4
Tiny Go	Ravikanth Chaganti	ghcr.io/rchaganti/vsc-devcontainer-features/tinygo:1	1.0.5
The WebAssembly Binary Toolkit	Ravikanth Chaganti	ghcr.io/rchaganti/vsc-devcontainer-features/wabt:1	1.1.1
Common Amazon Linux 2 Utilities	Ken Collins	ghcr.io/customink/codespaces-features/common-amzn:1	1.0.0
Docker-in-Docker Amazon Linux 2	Ken Collins	ghcr.io/customink/codespaces-features/docker-in-docker-amzn:1	1.0.1
Set Docker Log Level	Ken Collins	ghcr.io/customink/codespaces-features/docker-log-level:1	1.0.0
AWS SAM CLI Utility	Ken Collins	ghcr.io/customink/codespaces-features/sam-cli:1	1.2.0
Add Host	Stuart Leeks	ghcr.io/stuartleeks/dev-container-features/add-host:1	1.0.3
Azure CLI Persistence	Stuart Leeks	ghcr.io/stuartleeks/dev-container-features/azure-cli-persistence:0	0.0.6
Dev Tunnels	Stuart Leeks	ghcr.io/stuartleeks/dev-container-features/dev-tunnels:0	0.0.1
Shell History	Stuart Leeks	ghcr.io/stuartleeks/dev-container-features/shell-history:0	0.0.6
golangci-lint	guiyomh	ghcr.io/guiyomh/features/golangci-lint:0	0.1.2
gomarkdoc	guiyomh	ghcr.io/guiyomh/features/gomarkdoc:0	0.1.0
goreleaser	guiyomh	ghcr.io/guiyomh/features/goreleaser:0	0.1.1
gotestsum	guiyomh	ghcr.io/guiyomh/features/gotestsum:0	0.1.1
just	guiyomh	ghcr.io/guiyomh/features/just:0	0.1.0
mage	guiyomh	ghcr.io/guiyomh/features/mage:0	0.1.0
pact-go	guiyomh	ghcr.io/guiyomh/features/pact-go:0	0.1.1
vim	guiyomh	ghcr.io/guiyomh/features/vim:0	0.0.1
Hypermodern Python	Nate Scherer	ghcr.io/natescherer/devcontainers-custom-features/hypermodern-python:1	1.0.0
k9s	Nate Scherer	ghcr.io/natescherer/devcontainers-custom-features/k9s:1	1.0.0
PowerShell Resources	Nate Scherer	ghcr.io/natescherer/devcontainers-custom-features/powershell-resources:1	1.1.0
mitmproxy https proxy	Josh Spicer	ghcr.io/joshspicer/features/mitm-proxy:1	1.0.3
OCI Container Utils	Josh Spicer	ghcr.io/joshspicer/features/oci-utils:1	1.0.5
blackfire	Shyim	ghcr.io/shyim/devcontainers-features/blackfire:0	0.0.1
bun	Shyim	ghcr.io/shyim/devcontainers-features/bun:0	0.0.1
php	Shyim	ghcr.io/shyim/devcontainers-features/php:0	0.1.4
shopware-cli	Shyim	ghcr.io/shyim/devcontainers-features/shopware-cli:0	0.0.2
symfony-cli	Shyim	ghcr.io/shyim/devcontainers-features/symfony-cli:0	0.0.1
make	jungaretti	ghcr.io/jungaretti/features/make:1	1.0.1
ripgrep	jungaretti	ghcr.io/jungaretti/features/ripgrep:1	1.0.1
vim	jungaretti	ghcr.io/jungaretti/features/vim:1	1.0.0
msquic	tlc-sundown	ghcr.io/tlc-sundown/devcontainers-features/msquic:1	1.0.0
Volta	Enrico Secondulfo	ghcr.io/enricosecondulfo/devcontainer-features/volta:1	1.0.0
Assume AWS Role	saml-to	ghcr.io/saml-to/devcontainer-features/assume-aws-role:2	2.0.1
Cloud Native development environment tools	rjfmachado	ghcr.io/rjfmachado/devcontainer-features/cloud-native:1	1.0.7
Shellcheck	lukewiwa	ghcr.io/lukewiwa/features/shellcheck:0	0.2.3
wait-for-it	lukewiwa	ghcr.io/lukewiwa/features/wait-for-it:0	0.1.1
Chezmoi Dotfile Manager	rio	ghcr.io/rio/features/chezmoi:1	1.1.0
k3d	rio	ghcr.io/rio/features/k3d:1	1.1.0
k9s	rio	ghcr.io/rio/features/k9s:1	1.1.5
Kustomize	rio	ghcr.io/rio/features/kustomize:1	1.1.2
Skaffold Container & Kubernetes Development	rio	ghcr.io/rio/features/skaffold:2	2.0.0
vcluster	rio	ghcr.io/rio/features/vcluster:1	1.0.1
Kusion	KusionStack	ghcr.io/KusionStack/devcontainer-features/kusion:0	0.0.2
bats (Bash Automated Testing System)	edouard-lopez	ghcr.io/edouard-lopez/devcontainer-features/bats:0	0.0.1
Azure Functions Core Tools	jlaundry	ghcr.io/jlaundry/devcontainer-features/azure-functions-core-tools:1	1.0.0
SQL Server ODBC Driver	jlaundry	ghcr.io/jlaundry/devcontainer-features/mssql-odbc-driver:1	1.0.2
kotlinc	mikaello	ghcr.io/mikaello/devcontainer-features/kotlinc:1	1.1.0
Modern shell utils	mikaello	ghcr.io/mikaello/devcontainer-features/modern-shell-utils:2	2.0.0
codex	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/codex:1	1.0.0
Copacetic CLI	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/copa:1	1.0.0
crane	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/crane:1	1.0.0
CycloneDX CLI	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/cyclonedx:1	1.0.1
flux	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/flux:1	1.0.0
gic	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/gic:1	1.0.0
Gitleaks	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/gitleaks:1	1.0.0
jnv	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/jnv:1	1.0.0
K3D	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/k3d:1	1.0.0
Kyverno CLI	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/kyverno:1	1.0.0
notation	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/notation:1	1.0.0
ruff	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/ruff:1	1.0.0
skopeo	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/skopeo:1	1.0.0
uv/uvx	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/uv:1	1.0.0
zarf	jsburckhardt	ghcr.io/jsburckhardt/devcontainer-features/zarf:1	1.0.0
NAPPTIVE Playground CLI	oleksis	ghcr.io/oleksis/devcontainer-features/playground-cli:5	5.0.2
Python Launcher	oleksis	ghcr.io/oleksis/devcontainer-features/python-launcher:1	1.0.0
Emscripten	Eki Baskoro	ghcr.io/ebaskoro/devcontainer-features/emscripten:1	1.0.0
Grain	Eki Baskoro	ghcr.io/ebaskoro/devcontainer-features/grain:0	0.1.0
Scala (via SDKMAN!)	Eki Baskoro	ghcr.io/ebaskoro/devcontainer-features/scala:1	1.0.0
SDKMAN!	Eki Baskoro	ghcr.io/ebaskoro/devcontainer-features/sdkman:1	1.0.0
SMTP4Dev: A dotnet test email SMTP server	Warren Buckley	ghcr.io/warrenbuckley/codespace-features/smtp4dev:1	1.0.0
SQLite	Warren Buckley	ghcr.io/warrenbuckley/codespace-features/sqlite:1	1.0.0
Roost Cluster Creation	Roost.ai (Harish Agrawal)	ghcr.io/roost-io/features/roost:1	1.0.0
Clusterctl	Lennart Jern	ghcr.io/lentzi90/features/clusterctl:0	0.1.4
Kubeadm	Lennart Jern	ghcr.io/lentzi90/features/kubeadm:0	0.1.4
KWOK	Lennart Jern	ghcr.io/lentzi90/features/kwok:0	0.1.3
Tilt	Lennart Jern	ghcr.io/lentzi90/features/tilt:0	0.1.4
yamlfmt	Lennart Jern	ghcr.io/lentzi90/features/yamlfmt:0	0.1.0
Nextflow	Rob Syme	ghcr.io/robsyme/features/nextflow:1	1.2.0
nf-test	Rob Syme	ghcr.io/robsyme/features/nf-test:1	1.0.0
wasm + wasi for Dotnet	Brendan Burns	devwasm.azurecr.io/dev-wasm/dev-wasm-feature/dotnet-wasi:0	0.0.1
wasm + wasi for Go	Brendan Burns	devwasm.azurecr.io/dev-wasm/dev-wasm-feature/golang-wasi:0	0.0.2
wasm + wasi for Rust	Brendan Burns	devwasm.azurecr.io/dev-wasm/dev-wasm-feature/rust-wasi:0	0.0.2
Wasmtime runtime and WASI SDK	Brendan Burns	devwasm.azurecr.io/dev-wasm/dev-wasm-feature/wasmtime-wasi:0	0.0.16
Vale doc linter	Shine Pukur	ghcr.io/shinepukur/devcontainer-features/vale:1	1.0.0
GitLab CI Local	msclock	ghcr.io/msclock/features/gitlab-ci-local:0	0.0.7
Vcpkg Tool	msclock	ghcr.io/msclock/features/vcpkg:2	2.0.0
Fig	grant0417	ghcr.io/withfig/features/fig:1	1.0.2
micromamba	mamba-org	ghcr.io/mamba-org/devcontainer-features/micromamba:1	1.2.0
Astro CLI	fhoda	ghcr.io/astronomer/devcontainer-features/astro-cli:1	1.0.0
Bash profile	EliiseS	ghcr.io/eliises/devcontainer-features/bash-profile:1	1.0.1
Dev Container CLI (via npm)	EliiseS	ghcr.io/eliises/devcontainer-features/devcontainers-cli:1	1.0.0
Gitleaks	Matthieu Fronton	ghcr.io/frntn/devcontainers-features/gitleaks:1	1.0.3
Newman	Matthieu Fronton	ghcr.io/frntn/devcontainers-features/newman:1	1.0.1
Postman	Matthieu Fronton	ghcr.io/frntn/devcontainers-features/postman:1	1.0.0
Prism	Matthieu Fronton	ghcr.io/frntn/devcontainers-features/prism:1	1.0.0
direnv	ChristopherMacGown	ghcr.io/christophermacgown/devcontainer-features/direnv:1	1.0.1
easy-container-hooks	ChristopherMacGown	ghcr.io/christophermacgown/devcontainer-features/easy-container-hooks:1	1.0.0
mcfly	ChristopherMacGown	ghcr.io/christophermacgown/devcontainer-features/mcfly:1	1.0.2
minio-client	ChristopherMacGown	ghcr.io/christophermacgown/devcontainer-features/minio-client:1	1.0.1
Bazel (via Bazelisk)	Balazs23	ghcr.io/balazs23/devcontainers-features/bazel:1	1.0.1
Nx (via npm)	Balazs23	ghcr.io/balazs23/devcontainers-features/nx:1	1.0.1
tfenv	Mikael Ahlinder	ghcr.io/mickeahlinder/devcontainer-features/tfenv:1	1.1.0
hledger	James C Kimble Jr	ghcr.io/jckimble/devcontainer-features/hledger:1	1.32.2
Ngrok	James C Kimble Jr	ghcr.io/jckimble/devcontainer-features/ngrok:3	3.1.2
TailwindCSS Standalone CLI	r3dpoint	ghcr.io/r3dpoint/devcontainer-features/tailwindcss-standalone-cli:1	1.0.1
Trunk	trunk-io	ghcr.io/trunk-io/devcontainer-feature/trunk:1	1.1.0
SwiftFormat	Joseph Heck/Adam Fowler	ghcr.io/swift-server-community/swift-devcontainer-features/SwiftFormat:0	0.1.1
Foundation Networking	Joseph Heck/Adam Fowler	ghcr.io/swift-server-community/swift-devcontainer-features/foundationnetworking:1	1.0.0
jemalloc	Joseph Heck/Adam Fowler	ghcr.io/swift-server-community/swift-devcontainer-features/jemalloc:1	1.0.0
sqlite	Joseph Heck/Adam Fowler	ghcr.io/swift-server-community/swift-devcontainer-features/sqlite:1	1.0.0
swift-format	Joseph Heck/Adam Fowler	ghcr.io/swift-server-community/swift-devcontainer-features/swift-format:0	0.1.0
aicommit2 (via npm)	kvokka	ghcr.io/kvokka/features/aicommit2:1	1.0.0
codegpt (via Github Releases)	kvokka	ghcr.io/kvokka/features/codegpt:1	1.0.0
Lumen CLI Tool	kvokka	ghcr.io/kvokka/features/lumen:1	1.0.0
confd	Andrii Tararaka	ghcr.io/gickis/devcontainer-features/confd:1	1.0.0
gomplate	Andrii Tararaka	ghcr.io/gickis/devcontainer-features/gomplate:1	1.0.0
kubeconform	Andrii Tararaka	ghcr.io/gickis/devcontainer-features/kubeconform:1	1.0.1
kubeseal	Andrii Tararaka	ghcr.io/gickis/devcontainer-features/kubeseal:1	1.0.1
Semgrep (via pipx)	Jonathan Nagayoshi	ghcr.io/sonikro/devcontainer-features/semgrep:1	1.0.0
Microsoft SBOM-Tool	JasonTheDeveloper	ghcr.io/jasonthedeveloper/features/sbom:1	1.1.0
Grype	Dasith Wijes	ghcr.io/dasiths/devcontainer-features/grype:1	1.0.0
Syft	Dasith Wijes	ghcr.io/dasiths/devcontainer-features/syft:1	1.0.0
Mealstrom	Felix Wieland	ghcr.io/flexwie/devcontainer-features/maelstrom:1	1.0.0
1Password CLI	Felix Wieland	ghcr.io/flexwie/devcontainer-features/op:1	1.0.0
Pulumi	Felix Wieland	ghcr.io/flexwie/devcontainer-features/pulumi:1	1.0.0
Terraspace	Felix Wieland	ghcr.io/flexwie/devcontainer-features/terraspace:1	1.0.0
d2	Kevin Harrigan	ghcr.io/ksh5022/devcontainer-features/d2:1	1.0.0
dapr-cli	Dapr maintainers	ghcr.io/dapr/cli/dapr-cli:0	0.1.0
Go Install Packages	Azutake	ghcr.io/azutake/devcontainer-features/go-packages-install:0	0.0.2
bun	Michael Lohr	ghcr.io/michidk/devcontainers-features/bun:1	1.0.1
typos	Michael Lohr	ghcr.io/michidk/devcontainers-features/typos:1	1.0.0
typst	Michael Lohr	ghcr.io/michidk/devcontainers-features/typst:1	1.1.0
Apt can install packages on Debian-like systems	Xiaowei Wang	ghcr.io/wxw-matt/devcontainer-features/apt:0	0.2.1
A Shell Command Runner	Xiaowei Wang	ghcr.io/wxw-matt/devcontainer-features/command_runner:0	0.5.0
A Remote Shell Scripts Runner	Xiaowei Wang	ghcr.io/wxw-matt/devcontainer-features/script_runner:0	0.5.0
Salesforce CLI	Jason Vercellone	ghcr.io/vercellone/devcontainer-features/sfdx-cli:1	1.0.0
CDK for Terraform CLI (via npm)	Joe McKinnon	ghcr.io/joedmck/devcontainer-features/cdktf:1	1.0.0
Cloudflare Tunnel Client	Joe McKinnon	ghcr.io/joedmck/devcontainer-features/cloudflared:1	1.0.2
Serve (via NPM)	Joe McKinnon	ghcr.io/joedmck/devcontainer-features/serve:1	1.0.0
Cloudflare Wrangler CLI (via npm)	Joe McKinnon	ghcr.io/joedmck/devcontainer-features/wrangler:1	1.0.0
CircleCI CLI	Cody Taylor	ghcr.io/codeman99/features/circleci-cli:1	1.2.2
Deno cache setup	Cody Taylor	ghcr.io/codeman99/features/deno-cache:0	0.1.1
Exercism CLI	Cody Taylor	ghcr.io/codeman99/features/exercism-cli:1	1.0.2
Temporalio	Fernando Avalos	ghcr.io/favalos/devcontainer-features/temporalio:1	1.0.0
Dart	devcontainers-community	ghcr.io/devcontainers-community/templates/dart:1	1.0.0
TinyGo	devcontainers-community	ghcr.io/devcontainers-community/features/tinygo:1	1.1.0
SurrealDB	devcontainers-community	ghcr.io/devcontainers-community/features/surrealdb:1	1.0.0
Bazel	devcontainers-community	ghcr.io/devcontainers-community/features/bazel:1	1.1.0
direnv	devcontainers-community	ghcr.io/devcontainers-community/features/direnv:1	1.0.0
llvm	devcontainers-community	ghcr.io/devcontainers-community/features/llvm:3	3.0.0
Deno	devcontainers-community	ghcr.io/devcontainers-community/features/deno:1	1.1.0
Prettier	devcontainers-community	ghcr.io/devcontainers-community/npm-features/prettier:1	1.1.0
TypeScript	devcontainers-community	ghcr.io/devcontainers-community/npm-features/typescript:1	1.1.0
Bacon	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/bacon:0	0.1.8
Cargo Audit	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-audit:0	0.1.8
Cargo Binstall	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-binstall:0	0.1.8
cargo-bundle	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-bundle:0	0.1.8
Cargo Deny	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-deny:0	0.1.8
Cargo Expand	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-expand:0	0.1.8
Cargo LLVM Cov	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-llvm-cov:0	0.1.8
cargo-make	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-make:0	0.1.8
cargo-mobile	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-mobile:0	0.1.8
cargo-nextest	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-nextest:0	0.1.8
Cargo Watch	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-watch:0	0.1.8
Cargo Web	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cargo-web:0	0.1.8
Cosmonic	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/cosmonic:0	0.1.8
Dexterous Developer	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/dexterous_developer:0	0.1.8
Dioxus	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/dioxus:0	0.1.8
Fermyon Spin	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/fermyon-spin:0	0.1.8
Helix	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/helix:0	0.1.8
Honggfuzz	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/honggfuzz:0	0.1.8
Mprocs	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/mprocs:0	0.1.8
Rust Windows MSVC	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/rust_windows_msvc:0	0.1.8
sccache	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/sccache:0	0.1.8
Spin Message Trigger	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/spin-message-trigger:0	0.1.8
wasm bindgen cli	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/wasm-bindgen-cli:0	0.1.8
Wasm Server Runner	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/wasm-server-runner:0	0.1.8
Rust wasm32_unknown_unknown	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/wasm32-unknown-unknown:0	0.1.8
Wasmcloud	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/wasmcloud:0	0.1.8
Zellij	Lee-Orr	ghcr.io/lee-orr/rusty-dev-containers/zellij:0	0.1.8
mockery (Go)	Ivan Stasiuk	ghcr.io/brokeyourbike/devcontainer-features/mockery-go:0	0.2.0
reflex	Ivan Stasiuk	ghcr.io/brokeyourbike/devcontainer-features/reflex:0	0.2.0
Staticcheck	Ivan Stasiuk	ghcr.io/brokeyourbike/devcontainer-features/staticcheck:0	0.2.0
Vapor Toolbox	Nikita Kurpas	ghcr.io/nikitakurpas/features/vapor-toolbox:1	1.0.0
AWS CLI Persistence	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/aws-cli-persistence:1	1.0.3
Google Cloud CLI Persistence	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/gcloud-cli-persistence:1	1.0.3
Gel CLI	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/gel-cli:1	1.0.0
Github CLI Persistence	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/github-cli-persistence:1	1.0.3
Lamdera	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/lamdera:1	1.0.2
Mount pnpm Store	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/mount-pnpm-store:1	1.0.2
Terraform CLI Persistence	Joshua Ji	ghcr.io/joshuanianji/devcontainer-features/terraform-cli-persistence:1	1.0.2
Stripe CLI	Thanan Traiongthawon	ghcr.io/nullcoder/devcontainer-features/stripe-cli:1	1.0.0
npm registry	jayree	ghcr.io/jayree/devcontainer-features/npm-registry:1	1.0.1
Salesforce CLI (autocomplete)	jayree	ghcr.io/jayree/devcontainer-features/sf-autocomplete:1	1.0.4
Salesforce CLI (plugins)	jayree	ghcr.io/jayree/devcontainer-features/sf-plugins:1	1.0.3
Custom Root CA	bdsoha	ghcr.io/bdsoha/devcontainers/custom-root-ca:1	1.3.0
aws-sso-util (via pipx)	Tom Harvey	ghcr.io/tomharvey/devcontainer-features/aws-sso-util:1	1.0.0
Azure Developer CLI	Azure Developer CLI Team	ghcr.io/azure/azure-dev/azd:0	0.1.0
Skyramp CLI Tools	Skyramp, Inc.	ghcr.io/letsramp/devcontainer-features/skyramp:1	1.0.3
Earthly	Earthly Technologies	ghcr.io/earthly/devcontainer-features/earthly:1	1.0.0
Runme	Stateful, Inc.	ghcr.io/stateful/devcontainer-features/runme:0	0.1.0
1Password CLI	John Chlark Sumatra	ghcr.io/itsmechlark/features/1password:1	1.4.0
act	John Chlark Sumatra	ghcr.io/itsmechlark/features/act:1	1.2.1
Doppler CLI	John Chlark Sumatra	ghcr.io/itsmechlark/features/doppler:2	2.4.1
PostgreSQL	John Chlark Sumatra	ghcr.io/itsmechlark/features/postgresql:1	1.7.0
RabbitMQ Server	John Chlark Sumatra	ghcr.io/itsmechlark/features/rabbitmq-server:1	1.1.1
Redis Server	John Chlark Sumatra	ghcr.io/itsmechlark/features/redis-server:1	1.1.1
Snowflake ODBC	John Chlark Sumatra	ghcr.io/itsmechlark/features/snowflake-odbc:1	1.2.1
Trivy	John Chlark Sumatra	ghcr.io/itsmechlark/features/trivy:1	1.1.1
Atlas CLI	Marco Zaccaro	ghcr.io/marcozac/devcontainer-features/atlas:1	1.0.3
Buf CLI (via Github Releases)	Marco Zaccaro	ghcr.io/marcozac/devcontainer-features/buf:1	1.0.0
gofumpt (via Github Releases)	Marco Zaccaro	ghcr.io/marcozac/devcontainer-features/gofumpt:1	1.0.0
GoReleaser (via Github Releases)	Marco Zaccaro	ghcr.io/marcozac/devcontainer-features/goreleaser:1	1.0.0
protoc-gen-entgrpc (from source)	Marco Zaccaro	ghcr.io/marcozac/devcontainer-features/protoc-gen-entgrpc:1	1.0.0
ShellCheck (via Github Releases)	Marco Zaccaro	ghcr.io/marcozac/devcontainer-features/shellcheck:1	1.0.0
Persistence for DigitalOcean doctl CLI	ElanHasson	ghcr.io/elanhasson/devcontainer-features/digitalocean-doctl-cli-persistence:1	1.1.0
MCAP (via GitHub Releases)	Tiwaloluwa Ojo	ghcr.io/tiwaojo/features/mcap-cli:1	1.0.2
Julia (via Juliaup)	Julia Language Community	ghcr.io/julialang/devcontainer-features/julia:1	1.1.1
ko	John Rowley	ghcr.io/robbert229/devcontainer-features/ko:1	1.0.0
OpenTofu	John Rowley	ghcr.io/robbert229/devcontainer-features/opentofu:1	1.0.0
OperatorSDK	John Rowley	ghcr.io/robbert229/devcontainer-features/operator-sdk:1	1.0.0
PostgreSQL Client	John Rowley	ghcr.io/robbert229/devcontainer-features/postgresql-client:1	1.0.0
Android SDK	Filiph Siitam Sandström	ghcr.io/nordcominc/devcontainer-features/android-sdk:1	1.2.0
Wine	Maxim Slipenko	ghcr.io/maks1ms/devcontainers-features/wine:0	0.0.5
Container Structure Tests	Ty Schlichenmeyer	ghcr.io/schlich/cst-devcontainer-feature/container-structure-test:1	1.0.0
Container Structure Tests	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/container-structure-test:1	1.0.0
Cypress	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/cypress:1	1.0.1
Grafana	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/grafana:1	1.0.6
Helix	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/helix:1	1.0.0
Helmfile CLI	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/helmfile:1	1.0.0
Jenkins X 3	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/jenkins-x:1	1.0.0
Starship	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/just:0	0.1.5
Prometheus Node Exporter	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/node-exporter:1	1.0.0
Open Slides	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/openslides:1	1.1.0
Pigz	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/pigz:0	0.1.0
Pixz	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/pixz:0	0.1.0
PowerLevel10k	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/powerlevel10k:1	1.0.0
Rye	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/rye:1	1.2.3
Starship	Ty Schlichenmeyer	ghcr.io/schlich/devcontainer-features/starship:0	0.1.5
My Favorite Color	raucha	ghcr.io/raucha/devcontainer-features/color:1	1.0.3
Hello, World!	raucha	ghcr.io/raucha/devcontainer-features/hello:1	1.0.2
Pytorch	raucha	ghcr.io/raucha/devcontainer-features/pytorch:1	1.0.0
alpine-aws-cli	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-aws-cli:0	0.0.4
alpine-bash	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-bash:0	0.0.2
alpine-bat	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-bat:0	0.0.13
alpine-bottom	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-bottom:0	0.0.6
alpine-broot	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-broot:0	0.0.5
alpine-bun	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-bun:0	0.0.1
alpine-ctop	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-ctop:0	0.0.2
alpine-curl	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-curl:0	0.0.1
alpine-d2	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-d2:0	0.0.1
alpine-deno	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-deno:0	0.0.7
alpine-docker-outside-of-docker	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-docker-outside-of-docker:0	0.0.20
alpine-fswatch	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-fswatch:0	0.0.1
alpine-gh-cli	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-gh-cli:0	0.0.1
alpine-git	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-git:0	0.0.1
alpine-gpg	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-gpg:0	0.0.1
alpine-jq	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-jq:0	0.0.1
alpine-lazygit	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-lazygit:0	0.0.1
alpine-mage2postman	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-mage2postman:0	0.0.2
alpine-magento-cloud-cli	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-magento-cloud-cli:0	0.0.7
alpine-n98-magerun2	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-n98-magerun2:0	0.0.23
alpine-nano	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-nano:0	0.0.1
alpine-navi	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-navi:0	0.0.11
alpine-node	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-node:0	0.0.15
alpine-nushell	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-nushell:0	0.0.13
alpine-ohmyzsh	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-ohmyzsh:0	0.0.23
alpine-openssh	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-openssh:0	0.0.1
alpine-patch	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-patch:0	0.0.1
alpine-pgsql-client	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-pgsql-client:0	0.0.2
alpine-php-bcmath	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-bcmath:0	0.0.1
alpine-php-composer	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-composer:0	0.0.19
alpine-php-ftp	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-ftp:0	0.0.2
alpine-php-gd	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-gd:0	0.0.1
alpine-php-intl	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-intl:0	0.0.2
alpine-php-ldap	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-ldap:0	0.0.1
alpine-php-magento	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-magento:0	0.0.1
alpine-php-mariadb	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-mariadb:0	0.0.1
alpine-php-mssql	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-mssql:0	0.0.5
alpine-php-mysql	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-mysql:0	0.0.1
alpine-php-pcntl	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-pcntl:0	0.0.1
alpine-php-pgsql	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-pgsql:0	0.0.1
alpine-php-posix	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-posix:0	0.0.1
alpine-php-redis	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-redis:0	0.0.1
alpine-php-soap	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-soap:0	0.0.1
alpine-php-sockets	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-sockets:0	0.0.3
alpine-php-xdebug	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-xdebug:0	0.0.7
alpine-php-zip	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-php-zip:0	0.0.1
alpine-phpstorm-libs	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-phpstorm-libs:0	0.0.2
alpine-sentry-cli	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-sentry-cli:0	0.0.2
alpine-sig	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-sig:0	0.0.1
alpine-sshs	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-sshs:0	0.0.1
alpine-starship	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-starship:0	0.0.2
alpine-user	cirolosapio	ghcr.io/cirolosapio/devcontainers-features/alpine-user:0	0.0.3
Argo Workflows and CD CLI	audacioustux	ghcr.io/audacioustux/devcontainers/argo:1	1.0.1
AWS SAM CLI	audacioustux	ghcr.io/audacioustux/devcontainers/aws-sam-cli:1	1.0.1
Bazel	audacioustux	ghcr.io/audacioustux/devcontainers/bazel:1	1.0.0
Bun	audacioustux	ghcr.io/audacioustux/devcontainers/bun:1	1.0.0
Cilium	audacioustux	ghcr.io/audacioustux/devcontainers/cilium:1	1.0.0
Common Utilities Extras	audacioustux	ghcr.io/audacioustux/devcontainers/common-utils-extras:1	1.2.1
Ebort	audacioustux	ghcr.io/audacioustux/devcontainers/ebort:1	1.0.0
Fly.io CLI	audacioustux	ghcr.io/audacioustux/devcontainers/flyctl:1	1.0.0
Graal VM	audacioustux	ghcr.io/audacioustux/devcontainers/graalvm:1	1.1.0
K9s (Kubernetes CLI To Manage Your Clusters In Style!)	audacioustux	ghcr.io/audacioustux/devcontainers/k9s:1	1.0.1
Knative	audacioustux	ghcr.io/audacioustux/devcontainers/knative:1	1.0.1
Kubebuilder	audacioustux	ghcr.io/audacioustux/devcontainers/kubebuilder:1	1.0.0
Kustomize	audacioustux	ghcr.io/audacioustux/devcontainers/kustomize:1	1.0.0
Localstack	audacioustux	ghcr.io/audacioustux/devcontainers/localstack:1	1.0.1
Mirrord	audacioustux	ghcr.io/audacioustux/devcontainers/mirrord:1	1.0.0
Operator SDK	audacioustux	ghcr.io/audacioustux/devcontainers/operator-sdk:1	1.0.1
Buildpacks Pack CLI	audacioustux	ghcr.io/audacioustux/devcontainers/pack-cli:1	1.0.0
Pulumi	audacioustux	ghcr.io/audacioustux/devcontainers/pulumi:1	1.0.3
Scala Toolchain	audacioustux	ghcr.io/audacioustux/devcontainers/scala-toolchain:1	1.0.2
Taskfile	audacioustux	ghcr.io/audacioustux/devcontainers/taskfile:1	1.0.1
Tilt	audacioustux	ghcr.io/audacioustux/devcontainers/tilt:1	1.0.1
Vegeta - HTTP load testing tool and library	audacioustux	ghcr.io/audacioustux/devcontainers/vegeta:1	1.0.1
WASM Toolchain	audacioustux	ghcr.io/audacioustux/devcontainers/wasm-toolchain:1	1.0.1
Velero (via Github Releases)	xfrancois	ghcr.io/xfrancois/devcontainers-features/velero:1	1.0.0
ctlptl	nucleuscloud	ghcr.io/nucleuscloud/devcontainer-features/ctlptl:0	0.1.1
helmfile	nucleuscloud	ghcr.io/nucleuscloud/devcontainer-features/helmfile:0	0.1.0
sqlc	nucleuscloud	ghcr.io/nucleuscloud/devcontainer-features/sqlc:1	1.0.1
Cowsay	joshspicer	ghcr.io/joshspicer/more-features/cowsay:1	1.0.0
Vtex CLI	MarlonPassos-git	ghcr.io/marlonpassos-git/dev-container-features/vtex-cli:0	0.0.1
Buildah (via apt-get)	Paul Gilber	ghcr.io/paul-gilber/devcontainer-features/buildah-apt-get:1	1.0.0
Butane (via Homebrew)	Paul Gilber	ghcr.io/paul-gilber/devcontainer-features/butane-homebrew:1	1.0.0
Amazon EKS - eksctl (via Homebrew)	Paul Gilber	ghcr.io/paul-gilber/devcontainer-features/eksctl-homebrew:1	1.0.0
Jinja2 CLI (via Homebrew)	Paul Gilber	ghcr.io/paul-gilber/devcontainer-features/jinja2-cli-homebrew:1	1.0.0
OpenShift CLI (via Homebrew)	Paul Gilber	ghcr.io/paul-gilber/devcontainer-features/openshift-cli-homebrew:1	1.0.0
Yamllint (via Homebrew)	Paul Gilber	ghcr.io/paul-gilber/devcontainer-features/yamllint-homebrew:1	1.0.0
Bats libs: support, assert, detik and file	brokenpip3	ghcr.io/brokenpip3/devcontainers-bats/bats-libs:0	0.0.3
Bun	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/bun:1	1.2.0
chezmoi	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/chezmoi:1	1.0.0
commitizen (via pipx)	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/commitizen:1	1.0.0
Deno	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/deno:1	1.0.0
gitlint (via pipx)	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/gitlint:1	1.0.1
LaTeX Workshop	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/latex:1	1.3.2
Lua	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/lua:1	1.0.0
ollama	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/ollama:1	1.0.1
pre-commit (via pipx)	Pablo Ulloa	ghcr.io/prulloac/devcontainer-features/pre-commit:1	1.0.3
bun	lumenpink	ghcr.io/lumenpink/devcontainer-features/bun:0	0.0.1
wasm-pack	lumenpink	ghcr.io/lumenpink/devcontainer-features/wasm-pack:0	0.0.3
Android SDK	CASL0	ghcr.io/casl0/devcontainer-features/android-sdk:1	1.0.1
depot_tools	CASL0	ghcr.io/casl0/devcontainer-features/depot_tools:1	1.0.0
eksctl (via curl)	CASL0	ghcr.io/casl0/devcontainer-features/eksctl:1	1.0.0
AWS SAM CLI	goldsam	ghcr.io/goldsam/dev-container-features/aws-sam-cli:1	1.0.0
The CUE Data Constraint Language	goldsam	ghcr.io/goldsam/dev-container-features/cue-lang:1	1.0.0
Flux 2	goldsam	ghcr.io/goldsam/dev-container-features/flux2:1	1.0.1
ammonite (via Homebrew)	Georg Ofenbeck	ghcr.io/georgofenbeck/features/ammonite-homebrew:1	1.0.0
ammonite (via direct linux binary download)	Georg Ofenbeck	ghcr.io/georgofenbeck/features/ammonite-linuxbinary:1	1.0.0
lazygit (via Homebrew)	Georg Ofenbeck	ghcr.io/georgofenbeck/features/lazygit-homebrew:1	1.0.0
lazygit (via direct linux binary download)	Georg Ofenbeck	ghcr.io/georgofenbeck/features/lazygit-linuxbinary:1	1.0.0
TheFuck (via Homebrew)	Georg Ofenbeck	ghcr.io/georgofenbeck/features/thefuck-homebrew:1	1.0.0
thefuck (via pipx)	Georg Ofenbeck	ghcr.io/georgofenbeck/features/thefuck-pipx:1	1.0.0
Fish - persistent data	Niko Böckerman	ghcr.io/nikobockerman/devcontainer-features/fish-persistent-data:2	2.0.3
Poetry - persistent cache	Niko Böckerman	ghcr.io/nikobockerman/devcontainer-features/poetry-persistent-cache:1	1.0.1
Yarn - persistent cache	Niko Böckerman	ghcr.io/nikobockerman/devcontainer-features/yarn-persistent-cache:1	1.0.0
Ansible Lint (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/ansible-lint:2	2.0.0
Django-upgrade (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/django-upgrade:2	2.0.0
PyADR (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/pyadr:2	2.0.0
PyCQA tools bundle (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/pycqa:2	2.0.0
pymarkdownlnt (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/pymarkdownlnt:2	2.0.0
Pytest (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/pytest:2	2.0.0
Pyupgrade (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/pyupgrade:2	2.0.0
rstcheck (via pipx)	Hans Spaans	ghcr.io/hspaans/devcontainer-features/rstcheck:2	2.0.0
sshpass	Hans Spaans	ghcr.io/hspaans/devcontainer-features/sshpass:1	1.0.1
Bob build system	Dirk Louwers	ghcr.io/dlouwers/devcontainer-features/bob:1	1.0.0
Devbox	Dirk Louwers	ghcr.io/dlouwers/devcontainer-features/devbox:1	1.0.0
Chrome Testing	kreemer	ghcr.io/kreemer/features/chrometesting:1	1.0.1
Helix	kreemer	ghcr.io/kreemer/features/helix:1	1.0.1
Marksman	kreemer	ghcr.io/kreemer/features/marksman:1	1.0.0
Stow	kreemer	ghcr.io/kreemer/features/stow:1	1.1.0
Frida Core devkit	Vero	ghcr.io/veronoicc/devcontainer-features/frida-core-devkit:1	1.0.3
Frida Gum devkit	Vero	ghcr.io/veronoicc/devcontainer-features/frida-gum-devkit:1	1.0.1
LuaJIT 2.1.0-beta3	Vero	ghcr.io/veronoicc/devcontainer-features/luajit-2.1.0-beta3:1	1.0.0
install-php-extensions	leocavalcante	ghcr.io/opencodeco/devcontainers/install-php-extensions:0	0.1.225
difftastic	Valentin Heiligers	ghcr.io/va-h/devcontainers-features/difftastic:1	1.1.0
uv	Valentin Heiligers	ghcr.io/va-h/devcontainers-features/uv:1	1.1.4
AWS CLI	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/aws-cli:1	1.5.14
Azure CLI	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/azure-cli:1	1.0.6
Common Utilities	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/common-utils:1	1.4.25
Docker (Docker-in-Docker)	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/docker-in-docker:1	1.3.10
Docker (docker-outside-of-docker)	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/docker-outside-of-docker:1	1.3.10
Google Cloud CLI	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/gcloud-cli:1	1.0.17
Go	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/go:1	1.6.7
Terraform, tflint, and TFGrunt	Bart Venter	ghcr.io/bartventer/arch-devcontainer-features/terraform:1	1.3.8
bpmnlint	Waqqas Jabbar	ghcr.io/waqqas/feature/bpmnlint:1	1.0.1
dmnlint	Waqqas Jabbar	ghcr.io/waqqas/feature/dmnlint:1	1.0.1
Verilator	dalance	ghcr.io/veryl-lang/devcontainer-features/verilator:1	1.0.0
Veryl	dalance	ghcr.io/veryl-lang/devcontainer-features/veryl:1	1.0.0
Templ (via GitHub Release)	dusansimic	ghcr.io/dusansimic/devcontainer-features/templ:0	0.1.0
Lunarvim	Cadu Ribeiro	ghcr.io/duduribeiro/devcontainer-features/lunarvim:0	0.0.2
Neovim (from source)	Cadu Ribeiro	ghcr.io/duduribeiro/devcontainer-features/neovim:1	1.1.0
Tmux (from source)	Cadu Ribeiro	ghcr.io/duduribeiro/devcontainer-features/tmux:1	1.0.0
GitLab CLI	skriptfabrik	ghcr.io/skriptfabrik/devcontainer-features/gitlab-cli:1	1.1.1
Hetzner Cloud CLI	skriptfabrik	ghcr.io/skriptfabrik/devcontainer-features/hcloud-cli:1	1.0.0
Infisical CLI	skriptfabrik	ghcr.io/skriptfabrik/devcontainer-features/infisical-cli:1	1.1.1
An email and SMTP testing tool with API for developers	skriptfabrik	ghcr.io/skriptfabrik/devcontainer-features/mailpit:1	1.0.0
Terraform State management using Git	skriptfabrik	ghcr.io/skriptfabrik/devcontainer-features/terraform-backend-git:1	1.1.1
Packt Cli	Adrian Rusznica	ghcr.io/m4tchl0ck/devcontainer-features/pact-cli:1	1.0.1
My Powerlevel10K	Adrian Rusznica	ghcr.io/m4tchl0ck/devcontainer-features/powerlevel10k:1	1.0.0
structurizr-lite	Adrian Rusznica	ghcr.io/m4tchl0ck/devcontainer-features/structurizr-lite:1	1.0.1
Create Remote User	Nils Geistmann	ghcr.io/nils-geistmann/devcontainers-features/create-remote-user:0	0.0.4
exercism	Nils Geistmann	ghcr.io/nils-geistmann/devcontainers-features/exercism:0	0.0.1
zsh	Nils Geistmann	ghcr.io/nils-geistmann/devcontainers-features/zsh:0	0.0.7
OpenFGA CLI	Andrew Porter	ghcr.io/partydrone/devcontainer/features/openfga-cli:0	0.0.3
Goose CLI	Raphael Castro	ghcr.io/rafaph/devcontainer-features/goose-cli:1	1.0.0
Fly.io CLI	GMkonan	ghcr.io/gmkonan/fly-cli-feature/flyctl:1	1.0.0
Rye	E-gineering	ghcr.io/e-gineering/devcontainer-features/rye:1	1.3.0
Synology NAS Development	ChaosWars	ghcr.io/chaoswars/synology-features/toolkit:1	1.0.6
alpine-bindtools	tcaky	ghcr.io/tcaky/devcontainer-features/alpine-bindtools:0	0.0.1
alpine-powershell	tcaky	ghcr.io/tcaky/devcontainer-features/alpine-powershell:0	0.0.1
alpine-tzdata	tcaky	ghcr.io/tcaky/devcontainer-features/alpine-tzdata:0	0.0.1
yq and jq binaries	LarsNieuwenhuizen	ghcr.io/larsnieuwenhuizen/features/jqyq:0	0.0.1
NeoVim	LarsNieuwenhuizen	ghcr.io/larsnieuwenhuizen/features/neovim:0	0.0.2
Zellij	LarsNieuwenhuizen	ghcr.io/larsnieuwenhuizen/features/zellij:0	0.0.4
Openstack CLI	enrico9034	ghcr.io/enrico9034/devcontainer-features/openstack-cli:1	1.0.0
ANTLR4	nikiforovall	ghcr.io/nikiforovall/devcontainer-features/antlr4:1	1.0.0
.NET CSharpier	nikiforovall	ghcr.io/nikiforovall/devcontainer-features/dotnet-csharpier:1	1.0.0
helm-docs	dirsigler	ghcr.io/dirsigler/devcontainer-features/helm-docs:1	1.0.3
MagicMirror	sidecus	ghcr.io/sidecus/devcontainer-features/magicmirror:1	1.0.3
MATLAB	The MathWorks Inc.	ghcr.io/mathworks/devcontainer-features/matlab:0	0.2.0
Cascadia Code Font	Julian Pawlowski	ghcr.io/jpawlowski/devcontainer-features/cascadia-code:1	1.0.0
CLI for Microsoft 365	Julian Pawlowski	ghcr.io/jpawlowski/devcontainer-features/cli-microsoft365:1	1.1.0
GitHub Codespace dotfiles	Julian Pawlowski	ghcr.io/jpawlowski/devcontainer-features/codespaces-dotfiles:1	1.0.0
PnP PowerShell	Julian Pawlowski	ghcr.io/jpawlowski/devcontainer-features/pnp.powershell:1	1.0.0
PowerShell Extended [PSResourceGet / NuGet Versioning; Oh My Posh prompt profile]	Julian Pawlowski	ghcr.io/jpawlowski/devcontainer-features/powershell-extended:2	2.1.0
pre-commit(via pip)	gvatsal60 (Vatsal Gupta)	ghcr.io/gvatsal60/dev-container-features/pre-commit:1	1.0.6
SonarLint	gvatsal60 (Vatsal Gupta)	ghcr.io/gvatsal60/dev-container-features/sonarlint:1	1.0.1
terratag	git-saj	ghcr.io/git-saj/devcontainer-features/terratag:1	1.0.0
Dokku Remote CLI	Codefabrik GmbH	ghcr.io/code-fabrik/features/dokku-cli:1	1.0.0
Adobe Experience Manager Repo Tool	Juan Ayala	ghcr.io/juan-ayala/devcontainer-features/aem-repo-tool:1	1.0.1
Adobe Experience Manager SDK	Juan Ayala	ghcr.io/juan-ayala/devcontainer-features/aem-sdk:1	1.2.2
Adobe Experience Manager Universal Editor Service	Juan Ayala	ghcr.io/juan-ayala/devcontainer-features/aem-universal-editor-service:1	1.4.0
LocalStack CLI	LocalStack GmbH	ghcr.io/localstack/devcontainer-feature/localstack-cli:0	0.1.3
Atlassian Forge CLI (via npm)	Mark Gibson	ghcr.io/adaptavist/devcontainer-features/atlassian-forge:1	1.0.0
Antigen	Phil Bell	ghcr.io/phil-bell/devcontainer-features/antigen:1	1.0.3
Perl	Hauke D	ghcr.io/haukex/devcontainer-features/perl:1	1.0.2
Crystal Language	Caesarovich	ghcr.io/caesarovich/devcontainer-feature-crystal/crystal:1	1.1.0
act (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/act:1	1.0.15
act (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/act-asdf:2	2.0.15
actionlint (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/actionlint:1	1.0.7
GitHub Actions Runner	devcontainers-extra	ghcr.io/devcontainers-extra/features/actions-runner:1	1.0.13
Apache ActiveMQ (Classic) (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/activemq-sdkman:2	2.0.16
age (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/age:1	1.0.16
Akamai CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/akamai-cli:1	1.0.6
Prometheus Alertmanager (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/alertmanager:1	1.0.3
alp (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/alp-asdf:2	2.0.16
AWS Amplify CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/amplify-cli:2	2.0.16
Angular CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/angular-cli:2	2.0.16
Ansible (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ansible:2	2.1.1
Ant (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ant-sdkman:2	2.0.16
apko (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/apko:1	1.0.10
apt-get packages (for Debian/Ubuntu)	devcontainers-extra	ghcr.io/devcontainers-extra/features/apt-get-packages:1	1.0.8
apt packages (for Debian/Ubuntu)	devcontainers-extra	ghcr.io/devcontainers-extra/features/apt-packages:1	1.0.6
ArgoCD CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/argo-cd:1	1.0.3
AsciidoctorJ (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/asciidoctorj-sdkman:2	2.0.16
asdf package	devcontainers-extra	ghcr.io/devcontainers-extra/features/asdf-package:1	1.0.10
AssemblyScript (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/assemblyscript:2	2.0.16
Atlantis (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/atlantis:1	1.0.6
Atmos (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/atmos:1	1.0.6
AuditJS (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/auditjs:1	1.0.6
Autoenv (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/autoenv:1	1.0.6
AWS Cloud Development Kit (AWS CDK) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/aws-cdk:2	2.0.16
aws-eb-cli (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/aws-eb-cli:1	1.0.17
aws-sso-cli (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/aws-sso-cli:1	1.0.0
aztfexport (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/aztfexport:1	1.0.6
Azure Apiops (Extractor and Publisher) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/azure-apiops:1	1.0.2
Ballerina (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ballerina-sdkman:2	2.0.16
Bandit (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bandit:2	2.0.18
Bartib (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bartib:1	1.0.10
Bash Command	devcontainers-extra	ghcr.io/devcontainers-extra/features/bash-command:1	1.0.1
Beehive (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/beehive:1	1.0.15
Bikeshed (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bikeshed:2	2.0.18
bin (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bin:1	1.0.15
Black (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/black:2	2.0.18
Prometheus Blackbox Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/blackbox-exporter:1	1.0.3
bomber (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bomber:1	1.0.10
Bower (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bower:1	1.0.3
Bpipe (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/bpipe-sdkman:2	2.0.16
Brownie (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/brownie:2	2.0.18
Browserify (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/browserify:2	2.0.16
btop (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/btop-homebrew:1	1.0.21
BTrace (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/btrace-sdkman:2	2.0.16
Budibase CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/budibase-cli:1	1.0.3
buku (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/buku:1	1.0.5
Caddy (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/caddy:1	1.0.10
Ccache (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ccache-asdf:2	2.0.18
Checkov (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/checkov:1	1.0.17
chezscheme (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/chezscheme-asdf:2	2.0.18
Chisel (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/chisel:1	1.0.4
CircleCI CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/circleci-cli:1	1.0.8
Clojure (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/clojure-asdf:2	2.0.16
cloud-nuke (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cloud-nuke:1	1.0.6
Cloudflare Workers CLI (Wrangler) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cloudflare-wrangler:1	1.0.3
Cloudflare Tunnel client (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cloudflared:1	1.0.8
Cloudflare Tunnel client (FIPS) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cloudflared-fips:1	1.0.8
cloudinary-cli (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cloudinary-cli:1	1.0.17
cmake (via GitHub Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cmake:1	1.0.0
Codefresh CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/codefresh-cli:1	1.0.8
Composer (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/composer:1	1.0.1
Concurnas (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/concurnas-sdkman:2	2.0.16
ConnOR (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/connor-sdkman:2	2.0.16
consul (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/consul-asdf:2	2.0.16
Prometheus Consul Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/consul-exporter:1	1.0.3
Cookiecutter (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cookiecutter:2	2.0.18
copier (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/copier:7	7.0.15
Corepack (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/corepack:1	1.0.2
Cosign (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cosign:1	1.0.10
Coverage.py (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/coverage-py:2	2.0.18
Crystal (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/crystal-asdf:2	2.0.16
CUBA CLI (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cuba-sdkman:2	2.0.16
cURL (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/curl-apt-get:1	1.0.18
cURL (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/curl-homebrew:1	1.0.21
CVE Binary Tool (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cve-bin-tool:1	1.0.5
CXF (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cxf-sdkman:2	2.0.16
CycloneDX CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cyclonedx-cli:1	1.0.10
CycloneDX Python (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cyclonedx-python:1	1.0.5
Commitizen CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/cz-cli:1	1.0.2
D (via dlang.org)	devcontainers-extra	ghcr.io/devcontainers-extra/features/d:1	1.0.3
Dasel (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dasel-asdf:2	2.0.16
Dashlane CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dashlane-cli:1	1.0.15
Datadog CI CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/datadog-ci-cli:1	1.0.8
Datasette (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/datasette:2	2.0.18
dbt-coverage (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dbt-coverage:1	1.0.2
ddgr (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ddgr-apt-get:1	1.0.17
ddgr (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ddgr-homebrew:1	1.0.21
Deno (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/deno:1	1.0.3
Deno (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/deno-asdf:2	2.0.16
devcontainers CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/devcontainers-cli:1	1.0.1
DigitalOcean CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/digitalocean-cli:1	1.0.4
Direnv (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/direnv:1	1.0.3
direnv (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/direnv-asdf:2	2.0.16
Dive (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dive:1	1.0.15
Dnote (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dnote:1	1.0.10
docToolchain (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/doctoolchain-sdkman:2	2.0.16
dprint (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dprint-asdf:2	2.0.16
driftctl (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/driftctl:1	1.0.6
Drone CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/drone-cli:1	1.0.8
dua (Disk Usage Analyzer) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dua:1	1.0.15
duf (Disk Usage/Free Utility) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/duf:1	1.0.15
Dufs (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/dufs:1	1.0.15
EAS CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/eas-cli:1	1.0.11
Eget (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/eget:1	1.0.15
Elasticsearch (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/elasticsearch-asdf:2	2.0.16
Elm (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/elm-asdf:2	2.0.16
Ember CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ember-cli:1	1.0.3
Envoy (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/envoy:1	1.0.6
Epinio (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/epinio:1	1.0.1
etcd (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/etcd:1	1.0.12
exa (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/exa:1	1.0.15
Exercism CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/exercism-cli:1	1.0.7
Expo CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/expo-cli:1	1.0.11
Express Application Generator (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/express-generator:2	2.0.16
fd (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fd:1	1.0.15
FFmpeg (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ffmpeg-apt-get:1	1.0.17
Firebase CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/firebase-cli:2	2.0.16
fish (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fish-apt-get:1	1.0.5
fkill (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fkill:2	2.0.16
Flake8 (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/flake8:2	2.0.18
Flink (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/flink-sdkman:2	2.0.16
Flit (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/flit:2	2.0.18
Former2 CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/former2-cli:1	1.0.3
Fossil (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fossil-apt-get:1	1.0.17
Fossil (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fossil-homebrew:1	1.0.21
Fulcio (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fulcio:1	1.0.10
fzf (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/fzf:1	1.0.15
Gaiden (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gaiden-sdkman:2	2.0.16
Ganache (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ganache:1	1.0.3
gcovr (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gcovr:1	1.0.0
gdbgui (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gdbgui:2	2.0.18
GitHub CLI (via GitHub Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gh-cli:1	1.0.13
Github Release	devcontainers-extra	ghcr.io/devcontainers-extra/features/gh-release:1	1.0.26
Git LFS (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/git-lfs:1	1.0.3
Gitmux (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gitmux:1	1.0.10
git-o-matic (gitomatic) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gitomatic:1	1.0.15
Gitsign (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gitsign:1	1.0.10
gitsign-credential-cache (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gitsign-credential-cache:1	1.0.10
gitty (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gitty:1	1.0.15
Glances (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/glances:2	2.0.18
Task (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/go-task:1	1.0.6
GraalVM (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/graalvm-asdf:2	2.0.16
Gradle (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gradle-sdkman:2	2.0.16
Gradle profiler (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gradleprofiler-sdkman:2	2.0.16
Grails (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/grails-sdkman:2	2.0.16
Graphite.dev CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/graphite-cli:1	1.0.0
Prometheus Graphite Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/graphite-exporter:1	1.0.3
Groovy (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/groovy-sdkman:2	2.0.16
GroovyServ (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/groovyserv-sdkman:2	2.0.16
gRPCurl (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/grpcurl-asdf:2	2.0.16
Grype (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/grype:1	1.0.10
Gulp CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/gulp-cli:2	2.0.16
hadoop (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/hadoop-sdkman:2	2.0.16
Haskell (via ghcup)	devcontainers-extra	ghcr.io/devcontainers-extra/features/haskell:2	2.2.3
Hatch (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/hatch:2	2.0.18
Haxe (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/haxe-asdf:2	2.0.16
helmfile (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/helmfile:1	1.0.0
Heroku CLI (via cli-assets.heroku.com)	devcontainers-extra	ghcr.io/devcontainers-extra/features/heroku-cli:1	1.0.4
Homebrew Package	devcontainers-extra	ghcr.io/devcontainers-extra/features/homebrew-package:1	1.0.8
hotel (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/hotel:1	1.0.4
how2 (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/how2:1	1.0.10
http-server (by http-party) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/http-server:1	1.0.4
http4k (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/http4k-sdkman:2	2.0.16
hyperfine (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/hyperfine:1	1.0.15
immuadmin (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/immuadmin:1	1.0.10
immuadmin (FIPS) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/immuadmin-fips:1	1.0.10
immuclient (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/immuclient:1	1.0.10
immuclient (FIPS) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/immuclient-fips:1	1.0.10
immudb (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/immudb:1	1.0.10
immudb (FIPS) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/immudb-fips:1	1.0.10
Infracost (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/infracost:1	1.0.6
Infrastructor (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/infrastructor-sdkman:2	2.0.16
Invoke (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/invoke:1	1.0.4
Ionic CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ionic-cli:2	2.0.16
isort (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/isort:2	2.0.18
Istio CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/istioctl:1	1.0.6
jake (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jake:1	1.0.5
JBake (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jbake-sdkman:2	2.0.16
JBang (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jbang-sdkman:2	2.0.16
Jenkins X CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jenkinsx-cli:1	1.0.8
Jest (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jest:2	2.0.16
JFrog CLI (via jfrog.io)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jfrog-cli:1	1.0.9
JFrog CLI (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jfrog-cli-homebrew:1	1.0.15
JFrog CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jfrog-cli-npm:1	1.0.10
Jira CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jira-cli:1	1.0.8
JDK Mission Control (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jmc-sdkman:2	2.0.16
Apache JMeter (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jmeter-sdkman:2	2.0.16
Joern (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/joern-sdkman:2	2.0.16
JReleaser (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jreleaser-sdkman:2	2.0.16
jrnl (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jrnl:2	2.0.18
JSHint (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jshint:2	2.0.16
jsii compiler (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jsii:1	1.0.3
jsii-diff (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jsii-diff:1	1.0.3
jsii-pacmak (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jsii-pacmak:1	1.0.3
jsii-rosetta (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/jsii-rosetta:1	1.0.3
JSON Server (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/json-server:1	1.0.4
k2tf (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/k2tf:1	1.0.6
k6 (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/k6:1	1.0.3
Karaf (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/karaf-sdkman:2	2.0.16
Keeper Commander (Keeper CLI) (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/keepercommander:1	1.0.5
ki (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ki-sdkman:2	2.0.16
kind (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kind:1	1.0.15
Kobweb (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kobweb-sdkman:2	2.0.16
kOps (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kops:1	1.0.3
Kotlin (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kotlin-sdkman:2	2.0.16
kscript (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kscript-sdkman:2	2.0.16
KubeClarity CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kubeclarity-cli:1	1.0.10
Kubectl (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kubectl-asdf:2	2.0.16
Kubectx and Kubens (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kubectx-kubens:1	1.0.6
Kubie (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kubie:1	1.0.4
Kyverno CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/kyverno-cli:1	1.0.10
LastPass CLI (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lastpass-cli-homebrew:1	1.0.8
Layrry (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/layrry-sdkman:2	2.0.16
Lean (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lean-asdf:2	2.0.16
Lefthook (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lefthook-asdf:1	1.0.3
Leiningen (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/leiningen-sdkman:2	2.0.16
Lektor (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lektor:2	2.0.18
Lerna (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lerna-npm:1	1.0.11
Less (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/less:2	2.0.16
levant (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/levant-asdf:2	2.0.16
Lighthouse CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lighthouse-cli:1	1.0.4
Linkerd CLI (Edge) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/linkerd2-cli-edge:1	1.0.3
Linkerd CLI (Stable) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/linkerd2-cli-stable:1	1.0.3
Linode CLI (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/linode-cli:1	1.0.3
lite-server (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/lite-server:1	1.0.4
Live Server (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/live-server:1	1.0.4
Localstack (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/localstack:2	2.0.23
Localtunnel (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/localtunnel-npm:1	1.0.11
Mackup (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mackup:1	1.0.5
markdownlint-cli (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/markdownlint-cli:1	1.0.2
markdownlint-cli2 (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/markdownlint-cli2:1	1.0.2
Maven (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/maven-sdkman:2	2.0.16
Meltano ELT (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/meltano:2	2.0.18
Prometheus Memcached Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/memcached-exporter:1	1.0.3
micro (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/micro:1	1.0.7
Micronaut (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/micronaut-sdkman:2	2.0.17
Mise	devcontainers-extra	ghcr.io/devcontainers-extra/features/mise:1	1.0.0
mitmproxy (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mitmproxy:2	2.0.18
mkcert (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mkcert:1	1.0.15
MkDocs (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mkdocs:2	2.0.19
mlocate (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mlocate-apt-get:1	1.0.17
Mocha (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mocha:2	2.0.16
MongoDB Atlas CLI (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mongodb-atlas-cli-homebrew:1	1.0.15
MongoDB Shell (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mongosh-homebrew:1	1.0.21
Mosh (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mosh-apt-get:1	1.0.17
Mosh (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mosh-homebrew:1	1.0.21
Mule Flow Diagrams (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mulefd-sdkman:2	2.0.17
Maven Daemon (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mvnd-sdkman:2	2.0.17
MyBatis Migrations (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mybatis-sdkman:2	2.0.17
Mypy (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mypy:2	2.0.18
MySQL (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mysql-homebrew:1	1.0.21
Prometheus MySQL Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/mysqld-exporter:1	1.0.3
n8n (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/n8n:1	1.0.3
Namespace CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/namespace-cli:1	1.0.0
Nancy (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nancy:1	1.0.10
navi (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/navi:1	1.0.10
ncdu (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ncdu:1	1.0.7
Neko Virtual Machine (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/neko-asdf:2	2.0.16
Neo4j-Migrations (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/neo4jmigrations-sdkman:2	2.0.17
Neofetch (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/neofetch:1	1.0.7
Neovim (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/neovim-apt-get:1	1.0.20
Neovim (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/neovim-homebrew:1	1.0.21
NestJS CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nestjs-cli:2	2.0.16
Netdata (via my-netdata.io)	devcontainers-extra	ghcr.io/devcontainers-extra/features/netdata:1	1.0.11
Netlify CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/netlify-cli:1	1.0.4
Nim (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nim-asdf:2	2.0.16
Ninja (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ninja-asdf:2	2.0.16
Nmap (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nmap-apt-get:1	1.0.17
Nmap (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nmap-homebrew:1	1.0.21
nnn (n³) (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nnn-apt-get:1	1.0.17
nnn (n³) (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nnn-homebrew:1	1.0.21
Node.js (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/node-asdf:0	0.0.2
Prometheus Node Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/node-exporter:1	1.0.3
Nomad (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nomad-asdf:2	2.0.16
nox (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nox:2	2.0.18
NPM package	devcontainers-extra	ghcr.io/devcontainers-extra/features/npm-package:1	1.0.4
npm-packages	devcontainers-extra	ghcr.io/devcontainers-extra/features/npm-packages:1	1.0.1
nx (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/nx-npm:1	1.0.11
OCaml (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ocaml-asdf:2	2.0.16
OCaml (via opam)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ocaml-opam:1	1.1.0
oclif generator (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/oclif:1	1.0.3
Open Policy Agent (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/opa:1	1.0.6
Opam (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/opam-asdf:2	2.0.16
Ory CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ory-cli:1	1.0.6
Ory Hydra (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ory-hydra:1	1.0.6
Ory Kratos (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ory-kratos:1	1.0.6
Ory Oathkeeper (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ory-oathkeeper:1	1.0.6
Packer (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/packer-asdf:2	2.0.16
Pandoc (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pandoc:1	1.0.15
pass (password-store) (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pass-apt-get:1	1.0.5
PDM (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pdm:2	2.0.18
peco (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/peco-asdf:2	2.0.16
Perl (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/perl-asdf:2	2.0.16
Pierrot (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pierrot-sdkman:2	2.0.17
Pipenv (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pipenv:2	2.0.18
Pnpm (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pnpm:2	2.0.5
Podman (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/podman-homebrew:1	1.0.21
Poetry (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/poetry:2	2.0.18
Pomchecker (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pomchecker-sdkman:2	2.0.17
poppler-utils (pdftotext, pdftoppm, pdftops, pdfattach, pdfdetach, pdffonts, pdfimages, pdfinfo, pdfseparate, pdftocairo, pdftohtml, pdfunite) (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/poppler-utils-apt-get:1	1.0.1
PowerBI Visual Tools (pbiviz) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/powerbi-visuals-tools:2	2.0.16
PowerShell (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/powershell:1	1.0.14
Pre-Commit (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pre-commit:2	2.0.18
Prettier (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/prettier:1	1.0.2
Prisma CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/prisma:2	2.0.16
projen (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/projen:1	1.0.3
Prometheus (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/prometheus:1	1.0.3
PromLens (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/promlens:1	1.0.3
Protocol Buffer (Protobuf) Compiler (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/protoc:1	1.0.3
protoc (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/protoc-asdf:1	1.0.7
Pulumi (via get.pulumi.com)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pulumi:1	1.2.4
Prometheus Pushgateway (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pushgateway:1	1.0.3
pyinfra (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pyinfra:2	2.0.18
Pylint (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pylint:2	2.0.18
PyOxidizer (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pyoxidizer:1	1.0.6
PyScaffold (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/pyscaffold:2	2.0.18
qrcode (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/qrcode:2	2.0.18
Quarkus CLI (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/quarkus-sdkman:2	2.0.17
Quasar CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/quasar-cli:2	2.0.16
Raku (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/raku-asdf:1	1.0.18
Rclone (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/rclone:1	1.0.15
Redis (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/redis-homebrew:1	1.0.21
Rekor CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/rekor-cli:1	1.0.10
Renovate CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/renovate-cli:2	2.0.16
ripgrep (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ripgrep:1	1.0.15
rollup.js (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/rollup:2	2.0.16
Ruby (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ruby-asdf:0	0.0.2
Ruff (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ruff:1	1.1.1
Salesforce CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/salesforce-cli:1	1.0.3
Salesforce sfdx (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/salesforce-sfdx:1	1.0.3
Sanity.io CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sanity-cli:1	1.0.3
Project Piper (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sap-piper:1	1.0.10
sbt (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sbt-sdkman:2	2.0.16
Scala (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/scala-sdkman:2	2.0.16
Scala CLI (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/scalacli-sdkman:2	2.0.16
Scan (SAST) (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/scancode-toolkit:1	1.0.5
SchemaCrawler (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/schemacrawler-sdkman:2	2.0.17
sentinel (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sentinel-asdf:2	2.0.16
Serf (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/serf-asdf:2	2.0.16
shellcheck (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/shellcheck:1	1.0.0
shfmt (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/shfmt:1	1.0.2
Shopify CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/shopify-cli:1	1.0.4
sigstore-python (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sigstore-python:1	1.0.5
Snyk CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/snyk-cli:1	1.0.3
sops (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sops:1	1.0.15
Spacelift CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/spacectl:1	1.0.6
Spark (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/spark-sdkman:2	2.0.17
SpiceDB (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/spicedb:1	1.0.6
Spring Boot (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/springboot-sdkman:2	2.0.17
SqlFluff (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sqlfluff:1	1.0.3
Squarespace Local Development Server (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/squarespace-server:1	1.0.3
Sshoogr (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sshoogr-sdkman:2	2.0.17
Starship (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/starship:1	1.0.10
Starship (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/starship-homebrew:1	1.0.21
Prometheus StatsD Exporter (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/statsd-exporter:1	1.0.3
stew (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/stew:1	1.0.15
Supabase CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/supabase-cli:1	1.0.7
Surge CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/surge-cli:1	1.0.3
sv2v (SystemVerilog to Verilog) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/sv2v:1	1.0.15
svu (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/svu-asdf:2	2.0.16
Syft (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/syft:1	1.0.10
serve (by syntaqx) (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/syntaqx-serve:1	1.0.7
Tailscale (via tailscale.com)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tailscale:1	1.0.12
talosctl (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/talosctl:1	1.0.0
Taxi (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/taxi-sdkman:2	2.0.17
Tekton CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tekton-cli:1	1.0.8
Grafana Tempo (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tempo:1	1.0.8
Temporal CLI (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/temporal-cli:1	1.0.7
TerraCognita (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terracognita:1	1.0.6
Terraform (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terraform-asdf:2	2.0.16
terraform-docs (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terraform-docs:1	1.0.6
Terraform Language Server (terraform-ls) (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terraform-ls-asdf:2	2.0.16
Terraformer (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terraformer:1	1.0.6
Terragrunt (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terragrunt:1	1.0.15
Terramate (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terramate:1	1.0.6
terrascan (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/terrascan:1	1.0.2
tfc-agent (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tfc-agent-asdf:2	2.0.16
tfenv (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tfenv-homebrew:1	1.0.16
tfsec (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tfsec:1	1.0.6
Terraform Switcher (tfswitch) (via warrensbox/terraform-switcher)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tfswitch:1	1.0.11
tldr (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tldr:2	2.0.16
tmate (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tmate:1	1.0.7
tmux (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tmux-apt-get:1	1.0.17
tmux (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tmux-homebrew:1	1.0.21
Apache Tomcat (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tomcat-sdkman:2	2.0.17
ToolJet CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tooljet-cli:1	1.0.3
ToolKit (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/toolkit-sdkman:2	2.0.17
tox (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tox:2	2.0.18
tridentctl (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tridentctl-asdf:2	2.0.16
Truffle (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/truffle:1	1.0.3
ts-node (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ts-node:1	1.0.2
tsx (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/tsx:1	1.0.2
Turborepo (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/turborepo-npm:1	1.0.12
Twine (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/twine:2	2.0.18
TypeScript (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/typescript:2	2.0.16
Typst (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/typst:1	1.0.6
ufmt (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/ufmt:1	1.0.2
UPX (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/upx:1	1.0.15
Vault (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vault-asdf:2	2.0.16
Vercel CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vercel-cli:1	1.0.4
ncc (by Vercel) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vercel-ncc:1	1.0.4
pkg (by Vercel) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vercel-pkg:1	1.0.4
Release (by Vercel) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vercel-release:1	1.0.4
serve (by Vercel) (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vercel-serve:1	1.0.4
Visual Studio Code CLI	devcontainers-extra	ghcr.io/devcontainers-extra/features/vscode-cli:1	1.0.2
Visual Studio Code Server	devcontainers-extra	ghcr.io/devcontainers-extra/features/vscode-server:1	1.0.2
vtop (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vtop:2	2.0.16
Vue CLI (via npm)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vue-cli:2	2.0.16
Vulture (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/vulture:2	2.0.18
w3m (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/w3m-apt-get:1	1.0.17
w3m (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/w3m-homebrew:1	1.0.21
Waypoint (via asdf)	devcontainers-extra	ghcr.io/devcontainers-extra/features/waypoint-asdf:2	2.0.16
webi packages	devcontainers-extra	ghcr.io/devcontainers-extra/features/webi-packages:1	1.0.0
Webtau (via SDKMAN)	devcontainers-extra	ghcr.io/devcontainers-extra/features/webtau-sdkman:2	2.0.16
Wget (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/wget-apt-get:1	1.0.17
Wget (via Homebrew)	devcontainers-extra	ghcr.io/devcontainers-extra/features/wget-homebrew:1	1.0.21
WireGuard (via apt-get)	devcontainers-extra	ghcr.io/devcontainers-extra/features/wireguard-apt-get:1	1.0.12
XMRig (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/xmrig:1	1.0.3
Xonsh (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/xonsh:1	1.0.5
yamllint (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/yamllint:2	2.0.18
yapf (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/yapf:2	2.0.18
youtube-dl (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/youtube-dl:2	2.0.18
Youtube Uploader (via Github Releases)	devcontainers-extra	ghcr.io/devcontainers-extra/features/youtubeuploader:1	1.0.4
yt-dlp (via pipx)	devcontainers-extra	ghcr.io/devcontainers-extra/features/yt-dlp:2	2.0.18
Zig (via ziglang.org)	devcontainers-extra	ghcr.io/devcontainers-extra/features/zig:1	1.1.2
ZSH Plugins	devcontainers-extra	ghcr.io/devcontainers-extra/features/zsh-plugins:0	0.0.5
Cloudflare WARP CLI	Bas Steins	ghcr.io/bascodes/devcontainer-features/cf-warp-cli:1	1.0.2
debug-dump-env	Bas Steins	ghcr.io/bascodes/devcontainer-features/debug-dump-env:1	1.0.0
desktop	Bas Steins	ghcr.io/bascodes/devcontainer-features/desktop:0	0.0.1
desktop-fluxbox	Bas Steins	ghcr.io/bascodes/devcontainer-features/desktop-fluxbox:0	0.0.1
desktop-init	Bas Steins	ghcr.io/bascodes/devcontainer-features/desktop-init:0	0.0.1
desktop-novnc	Bas Steins	ghcr.io/bascodes/devcontainer-features/desktop-novnc:0	0.0.1
desktop-xserver	Bas Steins	ghcr.io/bascodes/devcontainer-features/desktop-xserver:0	0.0.1
kmod	Bas Steins	ghcr.io/bascodes/devcontainer-features/kmod:1	1.0.1
pkgx	Bas Steins	ghcr.io/bascodes/devcontainer-features/pkgx:1	1.0.0
set-dbus-machine-id	Bas Steins	ghcr.io/bascodes/devcontainer-features/set-dbus-machine-id:1	1.0.0
shoreman	Bas Steins	ghcr.io/bascodes/devcontainer-features/shoreman:1	1.0.0
tailscale.com	Bas Steins	ghcr.io/bascodes/devcontainer-features/tailscale.com:1	1.0.0
usbutils	Bas Steins	ghcr.io/bascodes/devcontainer-features/usbutils:1	1.0.0
webinstall.dev	Bas Steins	ghcr.io/bascodes/devcontainer-features/webinstall.dev:1	1.0.0
ecspresso	rhiroe	ghcr.io/rhiroe/features/ecspresso:1	1.1.0
saml2aws	rhiroe	ghcr.io/rhiroe/features/saml2aws:1	1.2.0
mingw	martinaskestad	ghcr.io/martinaskestad/features/mingw:1	1.0.0
Standard-ML of New Jersey	martinaskestad	ghcr.io/martinaskestad/features/smlnj:1	1.0.0
VIM, from source	martinaskestad	ghcr.io/martinaskestad/features/vimsrc:1	1.0.0
Bash	David Zucker	ghcr.io/davzucky/devcontainers-features-wolfi/bash:1	1.0.1
docker-outside-of-docker	David Zucker	ghcr.io/davzucky/devcontainers-features-wolfi/docker-outside-of-docker:1	1.2.0
python	David Zucker	ghcr.io/davzucky/devcontainers-features-wolfi/python:1	1.0.1
user	David Zucker	ghcr.io/davzucky/devcontainers-features-wolfi/user:1	1.0.0
Go Mod Cache	ForWarD Software	ghcr.io/forwardsoftware/devcontainer-features/go-mod-cache:1	1.0.0
LLVM	ChaosWars	ghcr.io/chaoswars/vscode-features/llvm:1	1.0.0
asdf-vm.com	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/asdf-vm.com:1	1.0.1
atuin.sh	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/atuin.sh:1	1.0.0
btop	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/btop:1	1.0.0
bun.sh	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/bun.sh:1	1.0.0
chezmoi.io	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/chezmoi.io:1	1.0.0
deno.com	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/deno.com:1	1.0.0
nixos.org	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/nixos.org:1	1.0.0
pkgx.sh	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/pkgx.sh:1	1.0.0
smallstep.com	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/smallstep.com:1	1.0.0
starship.rs	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/starship.rs:1	1.0.0
tailscale.com	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/tailscale.com:1	1.0.0
webinstall.dev	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/webinstall.dev:1	1.0.0
zellij.dev	devcontainer.community	ghcr.io/devcontainer-community/devcontainer-features/zellij.dev:1	1.0.0
AsciiDoc	Daniel Braun	ghcr.io/braun-daniel/devcontainer-features/asciidoc:1	1.3.0
fzf	Daniel Braun	ghcr.io/braun-daniel/devcontainer-features/fzf:1	1.0.0
Spaceship	Daniel Braun	ghcr.io/braun-daniel/devcontainer-features/spaceship:1	1.0.0
Bash Automated Testing System	Ivan Szkiba	ghcr.io/szkiba/devcontainer-features/bats:1	1.0.2
Markdown-based task runner for contributors	Ivan Szkiba	ghcr.io/szkiba/devcontainer-features/cdo:1	1.0.2
Go security checker	Ivan Szkiba	ghcr.io/szkiba/devcontainer-features/gosec:1	1.0.1
Go vulnerability scanner	Ivan Szkiba	ghcr.io/szkiba/devcontainer-features/govulncheck:1	1.0.3
Markdown code block authoring tool	Ivan Szkiba	ghcr.io/szkiba/devcontainer-features/mdcode:1	1.0.2
bpftool	TheDiveO	ghcr.io/thediveo/devcontainer-features/bpftool:0	0.0.2
docsify	TheDiveO	ghcr.io/thediveo/devcontainer-features/docsify:0	0.1.3
Go ebpf development	TheDiveO	ghcr.io/thediveo/devcontainer-features/go-ebpf:0	0.0.1
go-mod-upgrade	TheDiveO	ghcr.io/thediveo/devcontainer-features/go-mod-upgrade:0	0.1.1
Go Coverage with Badge	TheDiveO	ghcr.io/thediveo/devcontainer-features/gocover:0	0.1.2
Go Report Card	TheDiveO	ghcr.io/thediveo/devcontainer-features/goreportcard:0	0.1.1
Local Go Pkgsite	TheDiveO	ghcr.io/thediveo/devcontainer-features/local-pkgsite:0	0.1.5
pin-github-action	TheDiveO	ghcr.io/thediveo/devcontainer-features/pin-github-action:0	0.1.0
install and switch between multiple Docker CE versions	TheDiveO	ghcr.io/thediveo/devcontainer-features/wal-wahl:0	0.1.0
.NET Aspire	danmoseley	ghcr.io/dotnet/aspire-devcontainer-feature/dotnetaspire:1	1.0.0
Bitwarden CLI (bw)	Markus Zhang	ghcr.io/roul/devcontainer-features/bitwarden-cli:1	1.0.1
Bitwarden Secrets Manager CLI (bws)	Markus Zhang	ghcr.io/roul/devcontainer-features/bitwarden-secrets-manager:1	1.0.3
Kamal Deploy	Markus Zhang	ghcr.io/roul/devcontainer-features/kamal:1	1.0.3
Mise - mise-en-place version manager	Markus Zhang	ghcr.io/roul/devcontainer-features/mise:1	1.0.6
Bun (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-bun:1	1.0.2
Go (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-golang:1	1.0.4
Java (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-java:1	1.0.0
Node.js (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-node:1	1.0.3
Python (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-python:1	1.0.5
Ruby (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-ruby:1	1.0.2
Rust (via mise)	Markus Zhang	ghcr.io/roul/devcontainer-features/mise-rust:1	1.0.2
HashiCorp Vault	Markus Zhang	ghcr.io/roul/devcontainer-features/vault:1	1.0.2
dart-sass	Matthew Jorgensen (prplecake)	ghcr.io/prplecake/devcontainer-features/dart-sass:1	1.0.0
k6	Grafana Labs	ghcr.io/grafana/devcontainer-features/k6:1	1.1.3
xk6	Grafana Labs	ghcr.io/grafana/devcontainer-features/xk6:1	1.1.0
Struct Python Module Installer	httpdss	ghcr.io/httpdss/devcontainers-features/struct:1	1.0.0
code-server	Coder	ghcr.io/coder/devcontainer-features/code-server:1	1.1.0
mise-en-place	atty303	ghcr.io/atty303/devcontainer-features/mise:1	1.1.1
Alpine's apk packages	Mohammed Abdel Raouf (MuhmdRaouf)	ghcr.io/muhmdraouf/devcontainers-features/alpine-apk:0	0.0.1
ag - The Silver Searcher	John Ajera	ghcr.io/jajera/features/ag:1	1.0.0
Amazon Q CLI	John Ajera	ghcr.io/jajera/features/amazon-q-cli:1	1.0.0
Zip Utility	John Ajera	ghcr.io/jajera/features/zip:1	1.0.0
Buf CLI (via Github Releases)	MrSimonEmms	ghcr.io/mrsimonemms/devcontainers/buf:1	1.0.0
Cobra CLI	MrSimonEmms	ghcr.io/mrsimonemms/devcontainers/cobra-cli:1	1.0.0
Temporal Cloud CLI (tcld)	MrSimonEmms	ghcr.io/mrsimonemms/devcontainers/tcld:1	1.0.2
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Available Dev Container Templates
This table contains all official and community-supported Dev Container Templates known at the time of crawling each registered collection. This list is continuously updated with the latest available Template information. See the Template quick start repository to add your own!

Templates listed here will be presented in the UX of supporting tools.

Please note that if you need to report a Template, you should do so through the registry hosting the Template.

To add your own collection to this list, please create a PR editing this yaml file.

Search


Template Name	Maintainer	Reference	Latest Version
Alpine	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/alpine:3.4.0	3.4.0
Anaconda (Python 3)	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/anaconda:2.0.2	2.0.2
Anaconda (Python 3) & PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/anaconda-postgres:2.0.2	2.0.2
C++	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/cpp:3.0.3	3.0.3
C++ & MariaDB	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/cpp-mariadb:3.0.3	3.0.3
Debian	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/debian:3.0.2	3.0.2
Existing Docker Compose (Extend)	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/docker-existing-docker-compose:1.2.3	1.2.3
Existing Dockerfile	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/docker-existing-dockerfile:1.3.2	1.3.2
Docker in Docker	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/docker-in-docker:1.3.2	1.3.2
Docker outside of Docker	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/docker-outside-of-docker:1.3.2	1.3.2
Docker outside of Docker Compose	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/docker-outside-of-docker-compose:2.3.2	2.3.2
C# (.NET)	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/dotnet:3.5.0	3.5.0
F# (.NET)	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/dotnet-fsharp:3.1.2	3.1.2
C# (.NET) and MS SQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/dotnet-mssql:3.6.0	3.6.0
C# (.NET) and PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/dotnet-postgres:3.5.0	3.5.0
Go	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/go:4.2.0	4.2.0
Go & PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/go-postgres:4.2.0	4.2.0
Java	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/java:4.0.2	4.0.2
Java & PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/java-postgres:4.0.2	4.0.2
Node.js & JavaScript	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/javascript-node:4.0.2	4.0.2
Node.js & Mongo DB	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/javascript-node-mongo:4.0.2	4.0.2
Node.js & PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/javascript-node-postgres:4.0.2	4.0.2
Jekyll	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/jekyll:2.2.2	2.2.2
Kubernetes - Local Configuration	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/kubernetes-helm:1.4.2	1.4.2
Kubernetes - Minikube-in-Docker	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/kubernetes-helm-minikube:2.2.2	2.2.2
Markdown	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/markdown:1.1.2	1.1.2
Miniconda (Python 3)	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/miniconda:2.0.2	2.0.2
Miniconda & PostgreSQL (Python 3)	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/miniconda-postgres:2.0.2	2.0.2
PHP	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/php:4.2.0	4.2.0
PHP & MariaDB	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/php-mariadb:4.2.0	4.2.0
Python 3 & PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/postgres:2.2.0	2.2.0
Powershell	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/powershell:1.2.2	1.2.2
Python 3	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/python:4.1.0	4.1.0
Ruby	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/ruby:4.2.0	4.2.0
Ruby on Rails & Postgres	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/ruby-rails-postgres:4.2.0	4.2.0
Rust	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/rust:4.0.2	4.0.2
Rust & PostgreSQL	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/rust-postgres:4.0.2	4.0.2
Node.js & TypeScript	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/typescript-node:4.0.2	4.0.2
Ubuntu	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/ubuntu:1.3.2	1.3.2
Default Linux Universal	Dev Container Spec Maintainers	ghcr.io/devcontainers/templates/universal:1.1.2	1.1.2
.NET and Azure SQL	Azure SQL Developer Experiences Team	ghcr.io/microsoft/azuresql-devcontainers/dotnet:1.2.2	1.2.2
.NET with Aspire and Azure SQL	Azure SQL Developer Experiences Team	ghcr.io/microsoft/azuresql-devcontainers/dotnet-aspire:1.2.2	1.2.2
Node.js and Azure SQL	Azure SQL Developer Experiences Team	ghcr.io/microsoft/azuresql-devcontainers/javascript-node:1.2.2	1.2.2
Python and Azure SQL	Azure SQL Developer Experiences Team	ghcr.io/microsoft/azuresql-devcontainers/python:1.2.2	1.2.2
R (rocker/r-ver base)	Rocker Project	ghcr.io/rocker-org/devcontainer-templates/r-ver:1.1.2	1.1.2
R (r2u and bspm configured)	Rocker Project	ghcr.io/rocker-org/devcontainer-templates/r2u:0.3.1	0.3.1
Node.js	csutter	ghcr.io/csutter/devcontainer-templates/barebones-nodejs:0.1.0	0.1.0
Barebones Ruby	csutter	ghcr.io/csutter/devcontainer-templates/barebones-ruby:0.1.0	0.1.0
Basic Ruby application	csutter	ghcr.io/csutter/devcontainer-templates/basic-ruby:1.0.0	1.0.0
Azure Pipelines Agent	Marcel Lupo @Pwd9000-ML	ghcr.io/pwd9000-ml/devcontainer-templates/azure-pipelines-agent-devcontainer:1.0.0	1.0.0
GitHub Actions Runner	Marcel Lupo @Pwd9000-ML	ghcr.io/pwd9000-ml/devcontainer-templates/github-actions-runner-devcontainer:1.0.3	1.0.3
Thesis	Torben Wetter	ghcr.io/torbenwetter/iu-latex-container-templates/thesis:1.0.6	1.0.6
python with poetry	Israel Rescalvo	ghcr.io/standard-io/devcontainers-templates/python3-poetry-pyenv:0.0.3	0.0.3
ROS	Kenji Brameld	ghcr.io/ijnek/ros-devcontainer-template/ros:0.1.0	0.1.0
ROS 2 Workspace	Bruno-Pier Busque	ghcr.io/brunob81hk/ros2-workspace-devcontainer-template/ros2-workspace:1.0.0	1.0.0
Swift	Swift Server Workgroup	ghcr.io/swift-server/swift-devcontainer-template/swift:2.6.0	2.6.0
UNSW cs3231 OS Development	Hamish Cox	ghcr.io/hamishwhc/cs3231-devcontainer/cs3231:1.0.0	1.0.0
MultiversX: Smart Contracts Development (Rust)	MultiversX	ghcr.io/multiversx/mx-template-devcontainers/smart-contracts-rust:0.3.0	0.3.0
LaTeX Dev Container	John Muchovej	ghcr.io/jmuchovej/templates/latex:1.2.0	1.2.0
Typst Dev Container	John Muchovej	ghcr.io/jmuchovej/templates/typst:1.0.1	1.0.1
Rust on Nails	Ian Purton	ghcr.io/purton-tech/rust-on-nails/rust-on-nails:1.0.0	1.0.0
Viper Integrated Circuit Design Environment	Curtis Mayberry	ghcr.io/cascode-labs/viper-ic-devcontainers/viper-ic:0.1.0	0.1.0
Viper Integrated Circuit Design Environment	Curtis Mayberry	ghcr.io/cascode-labs/viper-ic-devcontainers/viper-ic-analog:0.1.0	0.1.0
Dart	devcontainers-community	ghcr.io/devcontainers-community/templates/dart:1.0.0	1.0.0
Jupyter Data Science Notebooks	devcontainers-community	ghcr.io/devcontainers-community/templates/jupyter-datascience-notebooks:2.0.0	2.0.0
Internet Computer	VVV Interactive | Internet Base	ghcr.io/vvv-interactive/ibdev/ic:1.7.0	1.7.0
Salesforce DX project	jayree	ghcr.io/jayree/devcontainer-templates/sf-project:1.0.2	1.0.2
Basic Node.js	Nafnix	ghcr.io/nafnix/devcontainers-templates/basic-nodejs:0.0.1	0.0.1
Basic Python	Nafnix	ghcr.io/nafnix/devcontainers-templates/basic-python:0.0.2	0.0.2
gleam	Nafnix	ghcr.io/nafnix/devcontainers-templates/gleam:0.0.1	0.0.1
Hugo & pnpm	Nafnix	ghcr.io/nafnix/devcontainers-templates/hugo-pnpm:0.0.1	0.0.1
pure	Nafnix	ghcr.io/nafnix/devcontainers-templates/pure:0.0.1	0.0.1
python3 & pyenv & pdm	Nafnix	ghcr.io/nafnix/devcontainers-templates/python3-pdm-pyenv:0.0.9	0.0.9
uv	Nafnix	ghcr.io/nafnix/devcontainers-templates/uv:0.0.1	0.0.1
Data Science with Python and R	VS Code Data Science	ghcr.io/microsoft/datascience-py-r/datascience-python-r:1.0.0	1.0.0
WP & MySQL	Wpdevenv	ghcr.io/wpdevenv/dev_container_templates/wp-mysql:0.1.1	0.1.1
Python 3 & Microsoft Sql Server	Azure Developer CLI Team	ghcr.io/azure-samples/python-ms-sql-devcontainer/python-mssql:1.0.0	1.0.0
Julia	Julia Language Community	ghcr.io/julialang/devcontainer-templates/julia:1.0.1	1.0.1
Node.js & TypeScript & Mirror	AliuQ	ghcr.io/aliuq/devcontainers/typescript-node-mirror:1.0.1	1.0.1
LINO	CGI France	ghcr.io/cgi-fr/lino-devcontainer/lino:1.1.0	1.1.0
Plantuml DevContainer	lnyousif	ghcr.io/lnyousif/plantuml-devcontainer/plantuml:1.0.0	1.0.0
Logic App Standard	mcollier	ghcr.io/mcollier/logic-app-dev-container-template/logic-app-standard:1.0.2	1.0.2
Go & Typescript	Pablo Ulloa	ghcr.io/prulloac/devcontainer-templates/go_typescript:1.1.0	1.1.0
Java & Typescript	Pablo Ulloa	ghcr.io/prulloac/devcontainer-templates/java_typescript:1.2.0	1.2.0
Python & Typescript	Pablo Ulloa	ghcr.io/prulloac/devcontainer-templates/python_typescript:1.1.0	1.1.0
Ruby & Typescript	Pablo Ulloa	ghcr.io/prulloac/devcontainer-templates/ruby_typescript:1.1.0	1.1.0
Rust & Typescript	Pablo Ulloa	ghcr.io/prulloac/devcontainer-templates/rust_typescript:1.1.0	1.1.0
Zig & Typescript	Pablo Ulloa	ghcr.io/prulloac/devcontainer-templates/zig_typescript:1.1.0	1.1.0
Qiskit	Mohd Shukri Hasan	ghcr.io/hsm207/devcontainer-templates/qiskit:0.0.1	0.0.1
Azure Functions (.NET)	Tatsuro Shibamura	ghcr.io/shibayan/devcontainers/azure-functions-dotnet:1.1.5	1.1.5
Azure Functions (Java)	Tatsuro Shibamura	ghcr.io/shibayan/devcontainers/azure-functions-java:1.1.4	1.1.4
Azure Functions (Node.js)	Tatsuro Shibamura	ghcr.io/shibayan/devcontainers/azure-functions-node:1.1.5	1.1.5
Azure Functions (PowerShell)	Tatsuro Shibamura	ghcr.io/shibayan/devcontainers/azure-functions-powershell:1.1.5	1.1.5
Azure Functions (Python)	Tatsuro Shibamura	ghcr.io/shibayan/devcontainers/azure-functions-python:1.1.5	1.1.5
Deno	RSM HCD Engineering	ghcr.io/rsm-hcd/devcontainer-templates/deno:0.4.0	0.4.0
Deno & PostgreSQL	RSM HCD Engineering	ghcr.io/rsm-hcd/devcontainer-templates/deno-postgres:0.4.0	0.4.0
.NET (C#), Node.js (TypeScript) & MS SQL	RSM HCD Engineering	ghcr.io/rsm-hcd/devcontainer-templates/dotnet-node-mssql:0.1.0	0.1.0
Bun	Marcos Gomes Neto	ghcr.io/marcosgomesneto/bun-devcontainers/basic-bun:0.0.6	0.0.6
Bun & MariaDB	Marcos Gomes Neto	ghcr.io/marcosgomesneto/bun-devcontainers/bun-mariadb:0.0.4	0.0.4
Bun & PostgreSQL	Marcos Gomes Neto	ghcr.io/marcosgomesneto/bun-devcontainers/bun-postgresql:0.0.3	0.0.3
Weik.io Integration Developer	Mikael Koskinen	ghcr.io/weikio/devcontainer-templates/weikio-integration-developer:1.1.1	1.1.1
ESP-IDF	johnluicn	ghcr.io/johnluicn/devcontainer-templates/esp-idf:0.2.0	0.2.0
Idris 2	joshuanianji	ghcr.io/joshuanianji/devcontainer-templates/idris2:0.1.0	0.1.0
Node.js & EdgeDB	joshuanianji	ghcr.io/joshuanianji/devcontainer-templates/javascript-node-edgedb:0.0.3	0.0.3
Rust & EdgeDB	joshuanianji	ghcr.io/joshuanianji/devcontainer-templates/rust-edgedb:0.0.1	0.0.1
Alloy	heathprovost	ghcr.io/heathprovost/alloy-devcontainer-template/alloy:1.0.0	1.0.0
SPFx	Troy	ghcr.io/tpalacino/spfx-dev-container/spfx-dev-container:1.1.2	1.1.2
Fabric Runtime	E-gineering	ghcr.io/e-gineering/devcontainer-templates/fabric-runtime:1.0.0	1.0.0
ros2 devcontainer template	Tony Najjar	ghcr.io/tonynajjar/ros2_devcontainer_template/ros2:0.0.2	0.0.2
Minimal devcontainer with LTS JAVA, official Clojure and clj tools	Carsten Behring	ghcr.io/scicloj/devcontainer-templates/basecloj:1.0.3	1.0.3
scicloj datascience devcontainer template	Carsten Behring	ghcr.io/scicloj/devcontainer-templates/scicloj:1.1.3	1.1.3
Flutter	ThePhaseless	ghcr.io/thephaseless/devcontainer-templates/flutter:1.0.0	1.0.0
Local Colab (Google Colab Image)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/local-colab:0.1.0	0.1.0
Miniforge3 (GPU)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/miniforge:0.1.0	0.1.0
Miniforge3 Docker (DinD and GPU)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/miniforge-dind:0.1.0	0.1.0
Python Docker (DinD)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/python-dind:0.1.0	0.1.0
Python (Kagle Image)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/python-kaggle:0.1.0	0.1.0
Python Utils (Pipx Tools)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/python-utils:0.1.0	0.1.0
Pytorch GPU (NGC and pipx)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/pytorch-gpu:0.1.0	0.1.0
Tensorflow GPU (NGC and pipx)	matheusfvesco	ghcr.io/matheusfvesco/devcontainer-templates/tensorflow-gpu:0.1.0	0.1.0
Mojo	sleter	ghcr.io/sleter/mojo-devcontainer/mojo:0.0.5	0.0.5
Adobe Experience Manager	Juan Ayala	ghcr.io/juan-ayala/devcontainer-templates/aem:1.2.0	1.2.0
LocalStack Docker-in-Docker	LocalStack GmbH	ghcr.io/localstack/devcontainer-template/localstack-dind:0.1.1	0.1.1
LocalStack Docker-outside-of-Docker	LocalStack GmbH	ghcr.io/localstack/devcontainer-template/localstack-dood:0.1.2	0.1.2
Universal for arm64	Alex Wegener	ghcr.io/lx-0/devcontainer-templates/universal-arm64:0.1.0	0.1.0
Flutter	techiro	ghcr.io/techiro/devcontainer-template/flutter:1.0.0	1.0.0
Pixi	Austin Gregg-Smith	ghcr.io/blooop/devcontainer-templates/pixi:1.0.4	1.0.4
Devcontainers Ziglang template	fardragon	ghcr.io/fardragon/devcontainers-zig-template/ziglang:0.2.0	0.2.0
Axon Ivy	axonivy	ghcr.io/axonivy/devcontainer-templates/axonivy:1.0.1	1.0.1
 
Manage cookies 
Microsoft
© 2025 Microsoft

Development Containers
Overview
Reference
Specification
Supporting Tools
Guides
Available Features
Available Templates
Collections
Collections
This list below contains pointers to official and community-contributed dev container assets, including Features and Templates. Collections on this list are continuously crawled for liveness, and can be presented in UX of spec supporting tools (i.e. it will be presented in the GitHub Codespaces and VS Code Dev Containers UX).

To add your own collection to this list, please create a PR editing this yaml file.

Search


Name	Maintainer	Repository
Reference Implementation Features	Dev Container Spec Maintainers	https://github.com/devcontainers/features
Reference Implementation Templates	Dev Container Spec Maintainers	https://github.com/devcontainers/templates
Azure SQL Database Dev Container Templates	Azure SQL Developer Experiences Team	https://github.com/microsoft/azuresql-devcontainers
Iterative Tools for Machine Learning Features	Iterative, Inc	https://github.com/iterative/features
Features for R	Rocker Project	https://github.com/rocker-org/devcontainer-features
Templates for R	Rocker Project	https://github.com/rocker-org/devcontainer-templates
Public Meaningful Features	Meaningful	https://github.com/meaningful-ooo/devcontainer-features
Assorted Features	Mike Priscella	https://github.com/mpriscella/features
Assorted Features	eitsupi	https://github.com/eitsupi/devcontainer-features
Assorted Features	Eric Ho	https://github.com/dhoeric/features
Assorted Features	Ravikanth Chaganti	https://github.com/rchaganti/vsc-devcontainer-features
Amazon Linux 2 Features	Ken Collins	https://github.com/customink/codespaces-features
Assorted Features	Stuart Leeks	https://github.com/stuartleeks/dev-container-features
Assorted Features	guiyomh	https://github.com/guiyomh/features
Development Container Custom Features	Nate Scherer	https://github.com/natescherer/devcontainers-custom-features
Features by @joshspicer	Josh Spicer	https://github.com/joshspicer/features
PHP Features	Shyim	https://github.com/shyim/devcontainers-features
Fun Features	jungaretti	https://github.com/jungaretti/features
libmsquic feature for HTTP/3 support	tlc-sundown	https://github.com/tlc-sundown/devcontainers-features
Assorted Features	Enrico Secondulfo	https://github.com/enricosecondulfo/devcontainer-features
SAML.to Development Container Features	saml-to	https://github.com/saml-to/devcontainer-features
Cloud Native development environment tools	rjfmachado	https://github.com/rjfmachado/devcontainer-features
Wiwa's features	lukewiwa	https://github.com/lukewiwa/features
Container and Kubernetes Development Features	rio	https://github.com/rio/features
Kusion Features	KusionStack	https://github.com/KusionStack/devcontainer-features
Édouard-lopez' Features	edouard-lopez	https://github.com/edouard-lopez/devcontainer-features
jlaundry Features	jlaundry	https://github.com/jlaundry/devcontainer-features
Assorted Features	mikaello	https://github.com/mikaello/devcontainer-features
Devcontainer Features	jsburckhardt	https://github.com/jsburckhardt/devcontainer-features
Oleksis' Dev Container Features	oleksis	https://github.com/oleksis/devcontainer-features
Psibase templates	James-Mart	https://github.com/gofractally/psibase-devcontainer-template/issues
Baskoro OSI devcontainer features	Eki Baskoro	https://github.com/ebaskoro/devcontainer-features
A collection of useful GitHub CodeSpace features	Warren Buckley	https://github.com/warrenbuckley/codespace-features
Roost Cluster	Roost.ai (Harish Agrawal)	https://github.com/roost-io/features
lentzi90 devcontainer features	Lennart Jern	https://github.com/lentzi90/features
Nextflow devcontainer features	Rob Syme	https://github.com/robsyme/features
Wasmtime + WASI Web Assembly features	Brendan Burns	https://github.com/dev-wasm/dev-wasm-feature
shinepukur devcontainer features	Shine Pukur	https://github.com/shinepukur/devcontainer-features
msclock devcontainer features	msclock	https://github.com/msclock/features
Fig Dev Container Features	grant0417	https://github.com/withfig/features
Mamba Features	mamba-org	https://github.com/mamba-org/devcontainer-features
Astronomer Features	fhoda	https://github.com/astronomer/devcontainer-features
Devcontainer features by @EliiseS	EliiseS	https://github.com/EliiseS/devcontainer-features
Testing Automation Features & more	Matthieu Fronton	https://github.com/frntn/devcontainers-features
csutter's devcontainer templates	csutter	https://github.com/csutter/devcontainer-templates
Convenient features	ChristopherMacGown	https://github.com/ChristopherMacGown/devcontainer-features
Devcontainer features by @Balazs	Balazs23	https://github.com/Balazs23/devcontainers-features
Pwd9000-ML devcontainer templates	Marcel Lupo @Pwd9000-ML	https://github.com/Pwd9000-ML/devcontainer-templates
mickeahlinder devcontainer features	Mikael Ahlinder	https://github.com/mickeahlinder/devcontainer-features
jckimble Dev Container / Codespaces Features	James C Kimble Jr	https://github.com/jckimble/devcontainer-features
IU LaTeX Container Templates	Torben Wetter	https://github.com/TorbenWetter/iu-latex-container-templates
Python3 with Pyenv and Poetry	Israel Rescalvo	https://github.com/Standard-IO/devcontainers-templates
ROS Templates	Kenji Brameld	https://github.com/ijnek/ros-devcontainer-template
ROS 2 Workspace Templates	Bruno-Pier Busque	https://github.com/BrunoB81HK/ros2-workspace-devcontainer-template
Assorted Features	r3dpoint	https://github.com/r3dpoint/devcontainer-features
Swift Container Templates	Swift Server Workgroup	https://github.com/swift-server/swift-devcontainer-template
UNSW cs3231 OS Development	Hamish Cox	https://github.com/HamishWHC/cs3231-devcontainer
TRunk CLI Features (trunk.io)	trunk-io	https://github.com/trunk-io/devcontainer-feature
MultiversX Dev Container Templates	MultiversX	https://github.com/multiversx/mx-template-devcontainers
Swift Dev Container Features	Joseph Heck/Adam Fowler	https://github.com/swift-server-community/swift-devcontainer-features
Kvokka Dev Container Features	kvokka	https://github.com/kvokka/features
gickis Dev Container Features	Andrii Tararaka	https://github.com/gickis/devcontainer-features
sonikro Dev Container Features	Jonathan Nagayoshi	https://github.com/sonikro/devcontainer-features
Features by JasonTheDeveloper	JasonTheDeveloper	https://github.com/JasonTheDeveloper/features
Templates by John Muchovej	John Muchovej	https://github.com/jmuchovej/devcontainers
Features by dasiths	Dasith Wijes	https://github.com/dasiths/devcontainer-features
flexwie devcontainer features	Felix Wieland	https://github.com/flexwie/devcontainer-features
Rust on Nails	Ian Purton	https://github.com/purton-tech/rust-on-nails
ksh5022 devcontainer features	Kevin Harrigan	https://github.com/ksh5022/devcontainer-features
Dapr devcontainer features	Dapr maintainers	https://github.com/dapr/cli
Azutake Dev Container features	Azutake	https://github.com/azutake/devcontainer-features
Features by michidk	Michael Lohr	https://github.com/michidk/devcontainers-features
Integrated Circuit Design Environment Templates	Curtis Mayberry	https://github.com/cascode-labs/viper-ic-devcontainers
A powerful and handy feature that runs remote shell scripts	Xiaowei Wang	https://github.com/wxw-matt/devcontainer-features
Salesforce CLI Features	Jason Vercellone	https://github.com/vercellone/devcontainer-features
Features by joedmck	Joe McKinnon	https://github.com/joedmck/devcontainer-features
Features by CodeMan99	Cody Taylor	https://github.com/CodeMan99/features
Features by Favalos	Fernando Avalos	https://github.com/favalos/devcontainer-features
Community Templates	devcontainers-community	https://github.com/devcontainers-community
Community Features	devcontainers-community	https://github.com/devcontainers-community
Community npm Features	devcontainers-community	https://github.com/devcontainers-community/npm-features
Rusty Features	Lee-Orr	https://github.com/lee-orr/rusty-dev-containers
Assorted Features	Ivan Stasiuk	https://github.com/brokeyourbike/devcontainer-features
Internet Computer Templates	VVV Interactive | Internet Base	https://github.com/vvv-interactive/ibdev
Features by Nikita Kurpas	Nikita Kurpas	https://github.com/NikitaKurpas/features
Features by joshuanianji	Joshua Ji	https://github.com/joshuanianji/devcontainer-features
Features by nullcoder	Thanan Traiongthawon	https://github.com/nullcoder/devcontainer-features
Features by shepherdjerred	Jerred Shepherd	https://github.com/shepherdjerred/devcontainers-features
Features by jayree	jayree	https://github.com/jayree/devcontainer-features
Templates by jayree	jayree	https://github.com/jayree/devcontainer-templates
Features by bdsoha	bdsoha	https://github.com/bdsoha/devcontainers
Python3 with Pyenv and PDM	Nafnix	https://github.com/nafnix/devcontainers-templates
Data science with Python and R	VS Code Data Science	https://github.com/microsoft/datascience-py-r
Features by tomharvey	Tom Harvey	https://github.com/tomharvey/devcontainer-features
Azure Developer CLI Dev Container Feature	Azure Developer CLI Team	https://github.com/Azure/azure-dev
Skyramp Dev Container Feature	Skyramp, Inc.	https://github.com/letsramp/devcontainer-features
Earthly Dev Container Features	Earthly Technologies	https://github.com/earthly/devcontainer-features
Runme Container Features	Stateful, Inc.	https://github.com/stateful/devcontainer-features
Wpdevenv Templates	Wpdevenv	https://github.com/wpdevenv/dev_container_templates
Native Dev Container Features	John Chlark Sumatra	https://github.com/itsmechlark/features
Assorted Features	Marco Zaccaro	https://github.com/marcozac/devcontainer-features
Features by Elan Hasson	ElanHasson	https://github.com/ElanHasson/devcontainer-features
Python+MSSQL+Azure SQL Templates	Azure Developer CLI Team	https://github.com/Azure-Samples/python-ms-sql-devcontainer
Features by Tiwaloluwa Ojo	Tiwaloluwa Ojo	https://github.com/tiwaojo/features
Julia Language Features	Julia Language Community	https://github.com/JuliaLang/devcontainer-features
Julia Language Templates	Julia Language Community	https://github.com/JuliaLang/devcontainer-templates
Features by John Rowley	John Rowley	https://github.com/robbert229/devcontainer-features
AliuQ Templates	AliuQ	https://github.com/aliuq/devcontainers
Nordcom Group Inc.'s Dev Container Features	Filiph Siitam Sandström	https://github.com/NordcomInc/devcontainer-features
Features by Maxim Slipenko	Maxim Slipenko	https://github.com/Maks1mS/devcontainers-features
Container Structure Tests	Ty Schlichenmeyer	https://github.com/schlich/cst-devcontainer-feature
Rye	Ty Schlichenmeyer	https://github.com/schlich/devcontainer-features
Features by raucha	raucha	https://github.com/raucha/devcontainer-features
LINO PIMO SIGO Toolbox	CGI France	https://github.com/CGI-FR/lino-devcontainer/
Alpine DevContainer Features	cirolosapio	https://github.com/cirolosapio/devcontainers-features
Features by AudaciousTux	audacioustux	https://github.com/audacioustux/devcontainers
PlantUml DevContainer	lnyousif	https://github.com/lnyousif/plantuml-devcontainer
Features by xfrancois	xfrancois	https://github.com/xfrancois/devcontainers-features
Features by nucleuscloud	nucleuscloud	https://github.com/nucleuscloud/devcontainer-features
Awesome Features	joshspicer	https://github.com/joshspicer/more-features
Features by MarlonPassos-git	MarlonPassos-git	https://github.com/MarlonPassos-git/dev-container-features
DevContainers for Fedora-based Development	RonaldTM9999	https://github.com/RonaldTM9999/devcontainers
DevContainer Features by Paul Gilber	Paul Gilber	https://github.com/paul-gilber/devcontainer-features
Bats Features by Luigi Operoso	brokenpip3	https://github.com/brokenpip3/devcontainers-bats
Logic App Standard Template	mcollier	https://github.com/mcollier/logic-app-dev-container-template
Additional Dev Container Features by prulloac	Pablo Ulloa	https://github.com/prulloac/devcontainer-features
Additional Dev Container Templates by prulloac	Pablo Ulloa	https://github.com/prulloac/devcontainer-templates
Additional Dev Container Features by LumenPink	lumenpink	https://github.com/lumenpink/devcontainer-features
Templates by Mohd Shukri Hasan	Mohd Shukri Hasan	https://github.com/hsm207/devcontainer-templates
Dev Container Features by CASL0	CASL0	https://github.com/CASL0/devcontainer-features
Development Container Features by goldsam	goldsam	https://github.com/goldsam/dev-container-features
Azure Functions Dev Container Templates	Tatsuro Shibamura	https://github.com/shibayan/devcontainers
Dev Container Templates by RSM HCD Engineering	RSM HCD Engineering	https://github.com/rsm-hcd/devcontainer-templates
Additional Dev Container Features by Georg Ofenbeck	Georg Ofenbeck	https://github.com/GeorgOfenbeck/features
Dev Container Features by Niko Böckerman	Niko Böckerman	https://github.com/nikobockerman/devcontainer-features
Bun.sh Runtime Dev Container Templates	Marcos Gomes Neto	https://github.com/marcosgomesneto/bun-devcontainers
Weik.io Dev Container Templates	Mikael Koskinen	https://github.com/weikio/devcontainer-templates
Dev Container Features by Hans Spaans	Hans Spaans	https://github.com/hspaans/devcontainer-features
Dev Container Templates by johnluicn	johnluicn	https://github.com/johnluicn/devcontainer-templates
Bob buildsystem and DevBox features	Dirk Louwers	https://github.com/dlouwers/devcontainer-features
Dev Container Features by kreemer	kreemer	https://github.com/kreemer/features
Dev Container Features by Vero	Vero	https://github.com/veronoicc/devcontainer-features
Dev Container Templates by joshuanianji	joshuanianji	https://github.com/joshuanianji/devcontainer-templates
OpenCodeCo Dev Containers goodies	leocavalcante	https://github.com/opencodeco/devcontainers
Dev Container Features by Valentin	Valentin Heiligers	https://github.com/va-h/devcontainers-features
Alloy Dev Container Template	heathprovost	https://github.com/heathprovost/alloy-devcontainer-template
Arch Linux Dev Container Features	Bart Venter	https://github.com/bartventer/arch-devcontainer-features
BPMN and DMN linters	Waqqas Jabbar	https://github.com/waqqas/feature/
Veryl	dalance	https://github.com/veryl-lang/devcontainer-features/
Dev Container Features by dusansimic	dusansimic	https://github.com/dusansimic/devcontainer-features/
Dev Container Features (Cadu Ribeiro)	Cadu Ribeiro	https://github.com/duduribeiro/devcontainer-features/
Dev Container Features by skriptfabrik	skriptfabrik	https://github.com/skriptfabrik/devcontainer-features/
Dev Container Features by m4tchl0ck	Adrian Rusznica	https://github.com/m4tchl0ck/devcontainer-features/
Dev Container Features by nils-geistmann	Nils Geistmann	https://github.com/nils-geistmann/devcontainers-features/
OpenFGA CLI	Andrew Porter	https://github.com/partydrone/devcontainer
Dev Container Features by rafaph	Raphael Castro	https://github.com/rafaph/devcontainer-features
SPFx Dev Container	Troy	https://github.com/tpalacino/SPFx-dev-container
GMkonan devcontainer features	GMkonan	https://github.com/GMkonan/fly-cli-feature
Dev Container Features by E-gineering	E-gineering	https://github.com/e-gineering/devcontainer-features
Dev Container Templates by E-gineering	E-gineering	https://github.com/e-gineering/devcontainer-templates
ROS2 devcontainer Template	Tony Najjar	https://github.com/tonynajjar/ros2_devcontainer_template/
Clojure devcontainer templates	Carsten Behring	https://github.com/scicloj/devcontainer-templates/
Synology devcontainer Templates	ChaosWars	https://github.com/ChaosWars/synology-features/
Assorted Features	tcaky	https://github.com/tcaky/devcontainer-features
Dev & Container features	LarsNieuwenhuizen	https://github.com/LarsNieuwenhuizen/features
Dev Container Features by enrico9034	enrico9034	https://github.com/enrico9034/devcontainer-features
Dev Container Templates by ThePhaseless	ThePhaseless	https://github.com/ThePhaseless/devcontainer-templates
Devcontainer Features by nikiforovall	nikiforovall	https://github.com/nikiforovall/devcontainer-features
Dev Container Templates by matheusfvesco	matheusfvesco	https://github.com/matheusfvesco/devcontainer-templates
Dennis Irsigler Dev Container Features	dirsigler	https://github.com/dirsigler/devcontainer-features
Dev Container Templates by sleter	sleter	https://github.com/sleter/mojo-devcontainer
Devcontainer features by sidecus	sidecus	https://github.com/sidecus/devcontainer-features
MATLAB Feature for DevContainers	The MathWorks Inc.	https://github.com/mathworks/devcontainer-features
Julian Pawlowski Dev Container Features	Julian Pawlowski	https://github.com/jpawlowski/devcontainer-features
pre-commit hooks(via pip) & sonarlint	gvatsal60 (Vatsal Gupta)	https://github.com/gvatsal60/dev-container-features
Devcontainer features by git-saj	git-saj	https://github.com/git-saj/devcontainer-features
Devcontainer features by Codefabrik	Codefabrik GmbH	https://github.com/code-fabrik/features
Devcontainer features by Juan Ayala	Juan Ayala	https://github.com/juan-ayala/devcontainer-features
Devcontainer templates by Juan Ayala	Juan Ayala	https://github.com/juan-ayala/devcontainer-templates
LocalStack DevContainer Feature	LocalStack GmbH	https://github.com/localstack/devcontainer-feature
LocalStack DevContainer Template	LocalStack GmbH	https://github.com/localstack/devcontainer-template
DeepSpaceCartel DevContainer Features	DeepSpaceCartel Inc.	https://github.com/deep-space-cartel/devcontainers-features
Dev Container features by Adaptavist	Mark Gibson	https://github.com/adaptavist/devcontainer-features
Dev Container features by phil-bell	Phil Bell	https://github.com/phil-bell/devcontainer-features
Dev Container Templates by Alex Wegener	Alex Wegener	https://github.com/lx-0/devcontainer-templates
Hauke's Features for Development Containers	Hauke D	https://github.com/haukex/devcontainer-features
Devcontainer features by vmvarela	Victor M. Varela	https://github.com/vmvarela/devcontainer-features
Crystal features	Caesarovich	https://github.com/Caesarovich/devcontainer-feature-crystal
Dev Container Features by devcontainers-extra	devcontainers-extra	https://github.com/devcontainers-extra/features
devcontainer features by Bas Steins	Bas Steins	https://github.com/bascodes/devcontainer-features
devcontainer features by rhiroe	rhiroe	https://github.com/rhiroe/features
devcontainer features by martinaskestad	martinaskestad	https://github.com/martinaskestad/features
devcontainer features for wolfi base docker image	David Zucker	https://github.com/davzucky/devcontainers-features-wolfi
Dev Container Features by ForWarD Software	ForWarD Software	https://github.com/forwardsoftware/devcontainer-features
devcontainer feature to install apt dependencies defined in an `Aptfile.dev` file.	Viktor Schmidt	https://github.com/viktorianer/devcontainer-features/tree/main/src/apt
devcontainer features by ChaosWars	ChaosWars	https://github.com/ChaosWars/vscode-features
Community features by devcontainer.community	devcontainer.community	https://github.com/devcontainer-community/devcontainer-features
Additional Dev Container Features by braun-daniel	Daniel Braun	https://github.com/braun-daniel/devcontainer-features
Dev Container Features by Ivan Szkiba	Ivan Szkiba	https://github.com/szkiba/devcontainer-features
devcontainer features by TheDiveO	TheDiveO	https://github.com/thediveo/devcontainer-features
devcontainer features by .NET Aspire	danmoseley	https://github.com/dotnet/aspire-devcontainer-feature
devcontainer features by RouL	Markus Zhang	https://github.com/RouL/devcontainer-features
devcontainer templates by techiro	techiro	https://github.com/techiro/devcontainer-template
Claude Code Feature	Anthropic	https://github.com/anthropics/devcontainer-features
devcontainer templates by blooop	Austin Gregg-Smith	https://github.com/blooop/devcontainer-templates
devcontainer features by prplecake	Matthew Jorgensen (prplecake)	https://github.com/prplecake/devcontainer-features
Ziglang devcontainer Template	fardragon	https://github.com/fardragon/devcontainers-zig-template
TTCN-3-Devcontainer	Muhammad Umair Khan	https://github.com/m-umair-khan-dev/devcontainers
Dev Container Features by Grafana Labs	Grafana Labs	https://github.com/grafana/devcontainer-features
Dev Container Features by httpdss	httpdss	https://github.com/httpdss/devcontainers-features
Axon Ivy devcontainer template	axonivy	https://github.com/axonivy/devcontainer-templates
Dev Container Features by Coder	Coder	https://github.com/coder/devcontainer-features
Dev Container Features by atty303	atty303	https://github.com/atty303/devcontainer-features
devcontainer features by MuhmdRaouf	Mohammed Abdel Raouf (MuhmdRaouf)	https://github.com/muhmdraouf/devcontainers-features
Dev Container Features by John Ajera	John Ajera	https://github.com/jajera/features
MrSimonEmms Dev Container Features	MrSimonEmms	https://github.com/mrsimonemms/devcontainers
 
Manage cookies 
Microsoft
© 2025 Microsoft