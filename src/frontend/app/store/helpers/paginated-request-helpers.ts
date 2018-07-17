import { Http, Request, RequestOptions } from '@angular/http';
import { forkJoin, Observable, of as observableOf } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';
import { CFResponse } from '../types/api.types';

export class BaseFetcher {
  constructor(private http: Http) {}
  public fetch(options: RequestOptions): Observable<any> {
    return this.http.request(new Request(options)).pipe(
      map(response => {
        let resData;
        try {
          resData = response.json();
        } catch (e) {
          resData = null;
        }
        return resData;
      }),
    );
  }
}

export class CfAPIFlattener extends BaseFetcher
  implements IPaginationFlattener<CFResponse, CFResponse> {
  constructor(http: Http, public requestOptions: RequestOptions) {
    super(http);
  }
  public pageUrlParam = 'page';
  public getTotalPages = res =>
    Object.keys(res).reduce((max, endpointGuid) => {
      const endpoint = res[endpointGuid];
      return max < endpoint.total_pages ? endpoint.total_pages : max;
    }, 0);
  public mergePages = (responses: CFResponse[]) => {
    // Merge all responses into the first page
    const newResData = responses[0];
    const endpointGuids = Object.keys(newResData);
    for (let i = 1; i < responses.length; i++) {
      // Make any additional page requests
      const endpointResponse = responses[i];
      endpointGuids.forEach(endpointGuid => {
        const endpoint = endpointResponse[endpointGuid];
        if (endpoint && endpoint.resources && endpoint.resources.length) {
          newResData[endpointGuid].resources = newResData[
            endpointGuid
          ].resources.concat(endpoint.resources);
        }
      });
    }
    return newResData;
  }
}

export interface IPaginationFlattener<T, Q> {
  getTotalPages: (res: T) => number;
  requestOptions: RequestOptions;
  pageUrlParam: string;
  mergePages: (res: T[]) => Q;
  fetch: (options: RequestOptions) => Observable<T>;
}

export function flattenPagination<T, Q>(
  firstRequest: Observable<T>,
  flattener: IPaginationFlattener<T, Q>,
) {
  return firstRequest.pipe(
    first(),
    mergeMap(firstResData => {
      // Discover the endpoint with the most pages. This is the amount of request we will need to make to fetch all pages from all
      // Make those requests
      const maxRequests = flattener.getTotalPages(firstResData);
      const requests = [];
      requests.push(observableOf(firstResData)); // Already made the first request, don't repeat it
      for (let i = 2; i <= maxRequests; i++) {
        // Make any additional page requests
        const requestOption = { ...flattener.requestOptions } as RequestOptions;
        requestOption.params.set(flattener.pageUrlParam, i.toString());
        requests.push(flattener.fetch(requestOption));
      }
      return forkJoin(requests);
    }),
    map((responses: T[]) => {
      // Merge all responses into the first page
      return flattener.mergePages(responses);
    }),
  );
}
