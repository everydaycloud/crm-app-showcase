CRM App for Small Businesses

This is a demo version of an app I built for a small sports club that had subscriptions
set up for their members, but it runs out of a community centre meaning there’s no
reception or a centralised system of checking people in. The app contains a database
of all current and past members that constantly updates through the payment provider’s
webhook (GoCardless) so that all coaches can access a member’s payment and membership
status without needing access to the payment system itself.

This app was also a steep learning curve but it was absolutely worth it. I set up the
Dockerfile, CI/CD pipeline and everything else from scratch and continue to benefit
from that experience.

# Tech

Python(typed with Pydantic), Quart(async flask), Postgres, Typescript,
React, ReactQuery, Docker, GitHub Actions, R2 file store (effectively free S3
provider by CloudFlare)

# Setup

## Backend

The backend serves the API for the frontends. The backend runs in
Python and requires a Postgres database running

To run the backend
[pdm](https://pdm.fming.dev/latest/) is required, once installed the
backend dependencies can be installed via,

    pdm install

the backend is run via,

    pdm run start

and runs on port 5050 by default, and the api served on the
api subdomain. You may need to run the recreate-db script (below)
prior to the start script - definitely if it is the first time.

The database credentials are stored in the .env files and the database can be
recreated via,

    pdm run recreate-db

Formatting, linting, and testing are done via

    pdm run format
    pdm run lint
    pdm run test


## Staff

The staff code provides the frontend interface. It runs
in node and the dependencies are installed via,

    npm install


the portal is run via,

    npm run start

and runs on port 3000 by default.

Formatting, and linting are done via,

    npm run format
    npm run lint
