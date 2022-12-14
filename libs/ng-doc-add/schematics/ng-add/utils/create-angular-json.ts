import {createSourceFile} from 'ng-morph';

/**
 *
 */
export function createAngularJson(): void {
	createSourceFile(
		'angular.json',
		`
{
  "version": 1,
  "defaultProject": "demo",
  "projects": {
    "demo": {
    	"root": ".",
        "architect": {
          "build": {
            "options": {
              "main": "test/main.ts"
             },
             "configurations": {
              	"production": {
              		"sourceMap": true,
					"optimization": true,
					"buildOptimizer": true,
					"aot": true
              	}
              }
          }
        }
    }
  }
}`,
	);
}
