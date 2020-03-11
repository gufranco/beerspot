import 'reflect-metadata';
import { Container } from 'typedi';
import prettyError from 'pretty-error';
import MainController from './controllers/MainController';

(async () => {
  prettyError.start();

  const mainController: MainController = Container.get(MainController);
  await mainController.run();
  // eslint-disable-next-line no-console
  console.log('Application is up and running!');
})();
