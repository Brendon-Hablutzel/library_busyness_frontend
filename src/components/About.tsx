import { useState } from 'react'
import busynessGraph from '../assets/busyness-graph.png'

const About = () => {
  const [busynessGraphLoaded, setBusynessGraphLoaded] = useState(false)

  return (
    <div className="min-h-[100vh] bg-bg-darkest text-text-light flex justify-center">
      <div className="flex flex-col justify-between gap-10 lg:gap-12 p-4 lg:p-6 w-[100%] max-w-[1200px] mb-24">
        <div className="flex flex-col items-center text-center text-text-light">
          <h1 className="sm:py-2 lg:p-0 font-bold filter drop-shadow-header text-2xl sm:text-4xl 2xl:text-5xl text-center">
            NC State Library Busyness
          </h1>
          <p className="mt-2 max-w-5xl text-sm sm:text-base md:text-lg text-text-light/85">
            learn about how this system was created, how data is collected, and how future busyness
            predictions are generated
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-medium mb-3">Data Source</h2>
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-16 justify-between">
            <div className="leading-relaxed text-lg text-justify">
              All data is sourced from the technology powering the real-time occupancy reporting
              websites for{' '}
              <a href="https://www.lib.ncsu.edu/busy-hill" target="_blank" className="underline">
                Hill
              </a>{' '}
              and{' '}
              <a href="https://www.lib.ncsu.edu/busy-hill" target="_blank" className="underline">
                Hunt
              </a>{' '}
              libraries—you can learn more about how that data is collected{' '}
              <a
                href="https://www.lib.ncsu.edu/privacy#occuspace"
                target="_blank"
                className="underline"
              >
                here
              </a>
              . In essence, a set of beacons placed around the libraries measure how many devices
              are connected to Wi-Fi in the area. This is then used to estimate the number of people
              in a given location, and this data is finally published via a publicly-accessible API.
              This system has been actively recording and storing data from that API since Fall
              2023.
            </div>
            <div className="flex flex-col gap-3">
              <code className="text-sm">
                <pre className="bg-bg-dark p-3 w-fit rounded-lg">
                  {'{'}
                  <br />
                  {'  '}"id": 270,
                  <br />
                  {'  '}"name": "Floor 2 West Wing General Seating",
                  <br />
                  {'  '}"count": 2,
                  <br />
                  {'  '}"percentage": 0.03,
                  <br />
                  {'  '}"timestamp": "2025-04-26T01:25:31.231Z",
                  <br />
                  {'  '}"isActive": true,
                  <br />
                  {'  '}"childCounts": null
                  <br />
                  {'}'}
                </pre>
              </code>
              <div className="text-center text-sm">
                Example API response from{' '}
                <a
                  href="https://www.lib.ncsu.edu/space-occupancy/realtime-data.php?id=266&library=hill"
                  target="_blank"
                  className="underline"
                >
                  this
                </a>{' '}
                endpoint
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-medium mb-3">Prediction Generation</h2>
          <div className="flex flex-col gap-5 justify-between">
            <div className="leading-relaxed text-lg text-justify">
              An analysis of a this data, even across a relatively short timespan, shows that
              busyness is remarkably predictable. Aside from spikes due to exams and dips during
              breaks, there are strong daily and weekly trends: busyness typically begins to sharply
              increase at around 8am, peaks at around 3pm, then decreases to almost zero people by
              around midnight. Peak and average busyness also tend to be the lowest on Saturday,
              increase for the next few days, peak on Wednesday, then decrease again.
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              {!busynessGraphLoaded ? <div className="w-[750px] h-[323px]"></div> : null}
              {/* dimensions: 1627 × 701 */}
              <img
                src={busynessGraph}
                width={750}
                alt="Graph showing recorded busyness from Fall 2023 to Spring 2025"
                onLoad={() => setBusynessGraphLoaded(true)}
              />
              <div className="text-center text-sm">
                Graph showing recorded busyness from Fall 2023 to Spring 2025
              </div>
            </div>
            <div className="leading-relaxed text-lg text-justify">
              To make predictions based on the extensive stored history of busyness data, this
              system uses an open source time series forecasting machine learning model called{' '}
              <a href="https://facebook.github.io/prophet/" target="_blank" className="underline">
                Prophet
              </a>
              . Prophet is designed to handle time series data that exhibits seasonality (regular,
              repeated patterns like the daily and weekly trends described above). It takes as input
              all of the past recorded data, some input configuration that can provide structure for
              which seasonalities to emphasize, and outputs busyness predictions. This system
              specifically runs Prophet every morning to generate busyness predictions for every 15
              minutes over the next few days.
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-medium mb-3">Technologies and System Architecture</h2>
          <div className="flex flex-col gap-5 justify-between">
            <div className="leading-relaxed text-lg text-justify">
              The backend for this system is event-driven, serverless, and hosted on AWS. It
              consists of several Lambdas for collecting data, making backups, performing inference
              with Prophet, and handling API requests from this website. The data collection Lambda,
              for example, is triggered by a scheduled EventBridge event—on execution, it fetches
              data from the libraries' busyness API and stores it in DynamoDB. Most of the Lambdas
              are written in TypeScript (the only exception being the Prophet inference Lambda,
              which is written in Python), and deployed via the AWS CDK for TypeScript.
            </div>
            <div className="leading-relaxed text-lg text-justify">
              The frontend, meanwhile, is written in React with TypeScript and hosted on Cloudflare
              Pages. It uses Vite as a build tool, Tailwind CSS for styling, and Recharts for data
              visualization.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
