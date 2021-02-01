# OWASP Juice Shop for Platform.sh

[![Deploy with Platform.sh](https://platform.sh/images/deploy/deploy-button-lg-blue.svg)](https://console.platform.sh/projects/create-project/?template=https://github.com/bkimminich/juice-shop&utm_campaign=deploy_on_platform?utm_medium=button&utm_source=affiliate_links&utm_content=https://github.com/bkimminich/juice-shop)

This template builds OWASP Juice Shop on Platform.sh. In the deployment process you will be able to choose from multiple regions (from Australia to the US West Coast) with strict data locality guarantees which could help you with latency as well as GDPR, German BDSG, Canadian PIPEDA, and the Australian Privacy Act compliance.

## Services

* Node 12

## Customizations

The following files have been added to a basic configuration.

* The `.platform/applications.yaml`, `.platform/services.yaml` and `.platform/routes.yaml` files have been added. These provide Platform.sh-specific configuration and are present in all projects on Platform.sh. You may customize them as you see fit.

Some specific configuration options you may want to notice:

* In `.platform/applications.yaml` the `variables.env.NODE_OPTIONS` with `max_old_space_size` has a magical value of 1536 this is because the build containers has 2GB of memory and would avoid getting webpack oom killed.
* In `.platform/applications.yaml` the `hooks.build` changes the sqlite database location where the RW mount point is.

## References

* [Node.js on Platform.sh](https://docs.platform.sh/languages/nodejs.html)
