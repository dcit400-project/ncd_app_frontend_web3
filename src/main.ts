import 'jeep-sqlite/dist/jeep-sqlite/jeep-sqlite.esm.js';
import { defineCustomElements as jeepSqliteLoader  } from 'jeep-sqlite/loader';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';



import { AppModule } from './app/app.module';
// Registers the <jeep-sqlite> element globally
jeepSqliteLoader();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
