# Customization

Via a YAML configuration file placed in `/config`, the OWASP Juice Shop
can be customized in its product inventory and look & feel. It also
allows to add an arbitrary number of fake users to make demonstrations
of `UNION`-SQL injections even more impressive. Furthermore the
_Challenge solved!_-notifications can be turned off for e.g. pure
presentation events.

## Instructions

To run a customized OWASP Juice Shop you need to:

1. Place your own `.yml` configuration file into `/config`
2. Set the environment variable `NODE_ENV` to the filename of your
   config via `export NODE_ENV=nameOfYourConfig` without the `.yml`
   extension.
3. Run `npm start`

You can also run a config directly in one command via
`NODE_ENV=nameOfYourConfig npm start`. By default the
[`config/default.yml`](config/default.yml) config is used which
generates the original OWASP Juice Shop look & feel and inventory.

> It is not necessary to run `npm install` after switching customization
> configurations. To verify if your custom configuration will not break
> any of the challenges, you should
> [run all tests](CONTRIBUTING.md#unit--integration-tests)
> via `npm test && npm run protractor`. If they pass, all functionality
> and challenges will be working fine!

## Default configuration

```yaml
server:
  port: 3000
application:
  domain: juice-sh.op                     # used for all user email addresses
  name: "OWASP Juice Shop"                # shown in title and menu bar 
  logoReplacementUrl: ~                   # URL to an image in PNG format to use as a logo instead of the default one
  faviconReplacementUrl: ~                # URL to an image in ICO format to use as a favicon instead of the default one
  numberOfRandomFakeUsers: 0              # number of random user accounts to be created (additional to pre-defined ones)
  showChallengeSolvedNotifications: true  # set to 'false' to hide all instant "challenge solved"-notifications
  theme: "slate"                          # Bootswatch theme used to render the UI (see https://bootswatch.com) 
products: []                              # if specified, the products to create instead of the default ones
```

### Product definitions

```yaml
products:
  - name: "Product Name"                    # (mandatory)
    price: 100                              # (optional) will be a random price if not specified
    description: "Product Description"      # (optional) will be a static "Lorem Ipsum" text if not specified
    image: "image.png"                      # (optional) will be undefined.png if not specified and...
    imageUrl: "https://product/image.png"   # (optional) ...a download URL is also not specified. Overrides "image" if both are specified
    useForProductTamperingChallenge: false  # (must be defined as "true" on exactly one product)
    useForChristmasChallenge: false         # (must be defined as "true" on exactly one product)
```

## Sample customizations

The following customizations are delivered out of the box with OWASP
Juice Shop:
* [The BodgeIt Store](https://github.com/bkimminich/juice-shop/blob/master/config/bodgeit.yml):
  An homage to
  [our server-side rendered ancestor](https://github.com/psiinon/bodgeit)
* [Sick-Shop](https://github.com/bkimminich/juice-shop/blob/master/config/sickshop.yml):
  A store that offers a variety of illnesses. _Achoo!_ Bless you!

## Credits

Kudos for envisioning and original implementation of this feature go to
[@wurstbrot](https://github.com/wurstbrot)!
