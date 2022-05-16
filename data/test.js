import PermissionsService from '../services/permissions/permissions';

export const config = async (req: Request, res: Response) => {
  const {
    body: { idAccount, configuration },
    user
  } = req;
  const fieldsError = requiredFieldsError({ idAccount, configuration }, 'body');
  if (fieldsError) {
    throw boom.badRequest(fieldsError);
  }

  const permissionsService = new PermissionsService(user, { accountId: idAccount });
  await permissionsService.insecureAuthenticationFunction(Resource.ACCOUNTS, Action.WRITE);
  
  let parsedConfiguration;
  try {
    parsedConfiguration = validateInstallationConfig(configuration);
  } catch (e) {
    if (e.name === 'ValidationError') {
      throw boom.badRequest("Some fields didn't pass validation", {
        details: e.details.map((detail: { message: string; path: string }) => ({
          message: detail.message,
          path: detail.path
        }))
      });
    } else if (e.name === 'YAMLException' || e.name === 'SyntaxError') {
      throw boom.badData(e.message);
    } else {
      throw e;
    }
  }

  await updateAccount(idAccount, { configuration: parsedConfiguration });

  return res.sendStatus(200);
};