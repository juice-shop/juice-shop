/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

import * as Config from "config";
import * as otplib from "otplib";
import { Product } from "../../data/types";
import * as utils from "../../lib/utils";

export default (on, config) => {
  on("task", {
    GetBlueprint() {
      for (const product of Config.get<Product[]>("products")) {
        if (product.fileForRetrieveBlueprintChallenge) {
          let blueprint = product.fileForRetrieveBlueprintChallenge;
          return blueprint;
        }
      }
    },
    GetFromConfig(variable: string) {
      return Config.get(variable);
    },
    GenerateAuthenticator(inputString: string) {
      return otplib.authenticator.generate(inputString);
    },
    toISO8601() {
      let date = new Date();
      return utils.toISO8601(date);
    },
  });
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
};
