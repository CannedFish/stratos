import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HelmReleaseHelperService } from '../helm-release-helper.service';

@Component({
  selector: 'app-helm-release-values-tab',
  templateUrl: './helm-release-values-tab.component.html',
  styleUrls: ['./helm-release-values-tab.component.scss']
})
export class HelmReleaseValuesTabComponent {

  public values$: Observable<string>;

  constructor(public helmReleaseHelper: HelmReleaseHelperService) {

    this.values$ = helmReleaseHelper.release$.pipe(
      map((release: any) => {
        if (release.config.raw) {
          return this.hidePasswords(release.config.raw);
        } else {
          return '';
        }
      })
    );
  }

  private hidePasswords(values: string): string {
    let mask = values.replace(new RegExp('(PASSWORD: [\.a-zA-Z0-9_\-]*)', 'gm'), 'PASSWORD: **********');
    mask = mask.replace(new RegExp('(password: [\.a-zA-Z0-9_\-]*)', 'gm'), 'password: **********');
    mask = mask.replace(new RegExp('(SECRET: [\.a-zA-Z0-9_\-]*)', 'gm'), 'SECRET: **********');
    mask = mask.replace(new RegExp('(secret: [\.a-zA-Z0-9_\-]*)', 'gm'), 'secret: **********');
    return mask;
  }
}
