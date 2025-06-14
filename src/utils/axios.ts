import axios from 'axios';

export const client = axios.create({
  baseURL: process.env.BASE_URL || 'https://mangafire.to',
  headers: {
    Cookie: "usertype=guest; cf_clearance=GyY43a9QaRKh0K22L9Xlv24BKZpp9lBo7E6O8_.M8ig-1744350198-1.2.1.1-xQttjYiNo3PzhoZ7JWg_j_ZOv4fgNF8WSB7Cqu279eFtN1aNKp1Bpkjz7hIWZ00Fn8MGd0xOi9vVdnq2iOTbW5OzOus8eIdka.DGyXkXDOC0g0o9n2lwDAEa1JYVZPXr4yjEnC5pP4xBBZZecUNwhQ37KNwKC7ECbyu0zssn3PbarKTe4SOUCXfNMNhNJh3xbDMN9xldKgIRZE2R1m8flWYujOg.NX7ByDAblvCNHjEnkGtROfH2gOBm_djbMIU_hr0hYTLxm60Dwu9WsqVjnTzpFCubIF4vU1oo0wa9BMHNxexn1Ut5bM.c93CMOyO.WCPmlx8Y73v7oNJ_yp9Tz.Q1A2M.lDPvMSs1bt.GycI",
    "User-Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari / 537.36",
    Referer: "https://mangafire.to/"
  }
});
