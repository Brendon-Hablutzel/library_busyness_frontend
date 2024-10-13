# NC State Library Busyness Frontend

This repository contains the React-based frontend for the NC State Library Busyness tracker project.

## Technologies

This site uses [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) + [React](https://react.dev/), with [Tailwind CSS](https://tailwindcss.com/) for styling and [recharts](https://recharts.org/en-US/) for data visualization. This branch's version of the site is deployed on Cloudflare pages.

The backend is kept in a separate (private, for now) repository, and is based on AWS serverless infrastructure.

## Development

Use the scripts provided in `package.json` to serve the site locally. Be sure to include a `.env` with the following variables:

- `REACT_APP_HISTORICAL_RECORDS_API_URL`
- `REACT_APP_FORECASTS_API_URL`
- `REACT_APP_METRICS_API_URL`

When contributing, use [Prettier](https://prettier.io/) with the configuration provided at the top level of this repository.

### Config

- See [this stackoverflow post](https://stackoverflow.com/questions/72027949/why-does-vite-create-two-typescript-config-files-tsconfig-json-and-tsconfig-nod) for why there are multiple `tsconfig` files
- Whenever the use of a new environment variable is required, it must be added to `vite.config.ts`

## Deployment

Cloudflare pages is set to automatically deploy from this branch when it is committed to.
