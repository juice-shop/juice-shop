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
import { Memory, Product } from "../../data/types";
import * as utils from "../../lib/utils";
const security = require("../../lib/insecurity");

export default (on, config) => {
  on("task", {
    GenerateCoupon(discount: number) {
      return security.generateCoupon(discount);
    },
    GetBlueprint() {
      for (const product of Config.get<Product[]>("products")) {
        if (product.fileForRetrieveBlueprintChallenge) {
          let blueprint = product.fileForRetrieveBlueprintChallenge;
          return blueprint;
        }
      }
    },
    GetChristmasProduct() {
      return Config.get<Product[]>("products").filter(
        (product: Product) => product.useForChristmasSpecialChallenge
      )[0];
    },
    GetCouponIntent() {
      const trainingData = require(`../../data/chatbot/${utils.extractFilename(
        Config.get("application.chatBot.trainingData")
      )}`);
      const couponIntent = trainingData.data.filter(
        (data: { intent: string }) => data.intent === "queries.couponCode"
      )[0];
      return couponIntent;
    },
    GetFromMemories(property: string) {
      for (const memory of Config.get<Memory[]>("memories")) {
        if (memory[property]) {
          return memory[property];
        }
      }
    },
    GetFromConfig(variable: string) {
      return Config.get(variable);
    },
    GetOverwriteUrl() {
      return Config.get("challenges.overwriteUrlForProductTamperingChallenge");
    },
    GetPastebinLeakProduct() {
      return Config.get<Product[]>("products").filter(
        (product: Product) => product.keywordsForPastebinDataLeakChallenge
      )[0];
    },
    GetTamperingProductId() {
      const products: Product[] = Config.get("products");
      for (let i = 0; i < products.length; i++) {
        if (products[i].urlForProductTamperingChallenge) {
          return i + 1;
        }
      }
    },
    GenerateAuthenticator(inputString: string) {
      return otplib.authenticator.generate(inputString);
    },
    toISO8601() {
      let date = new Date();
      return utils.toISO8601(date);
    },
    disableOnContainerEnv() {
      return utils.disableOnContainerEnv();
    },
    disableOnWindowsEnv() {
      return utils.disableOnWindowsEnv();
    },
  });
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
};
