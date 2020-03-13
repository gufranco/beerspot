import 'reflect-metadata';
import { Container } from 'typedi';
import prettyError from 'pretty-error';
import AppController from './controllers/AppController';

(async () => {
  prettyError.start();

  const mainController: AppController = Container.get(AppController);
  await mainController.run();
  // eslint-disable-next-line no-console
  console.log('Application is up and running!');
})();
