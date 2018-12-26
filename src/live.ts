import * as contrib from 'blessed-contrib'
import blessed from 'blessed'
import DonutData = contrib.Widgets.DonutData
import BarData = contrib.Widgets.BarData

import { DroneStatus } from './tello'

const createDonut = (label: string, value: number, high: boolean): DonutData => {
  const donut = { label, percent: `${value}`, color: null }

  if (high) {
    if (value < 25) donut.color = 'red'
    else if (value < 50) donut.color = 'yellow'
    else if (value < 75) donut.color = 'yellow'
    else donut.color = 'green'
  } else {
    if (value < 25) donut.color = 'green'
    else if (value < 50) donut.color = 'yellow'
    else if (value < 75) donut.color = 'yellow'
    else donut.color = 'red'
  }

  return donut
}

const droneToDonuts = (status: DroneStatus): DonutData[] => {
  // @ts-ignore
  if (status === {}) {
    throw Error('Drone info lost')
  }

  return [createDonut('battery', status.bat, true), createDonut('temp', status.temph, false)]
}

let timer = null

const sign = (value: number): '+' | '-' => (value < 0 ? '-' : '+')

const droneToAxisBars = (status: DroneStatus): BarData => {
  const titles = [`pitch${sign(status.pitch)}`, `roll${sign(status.pitch)}`, `yaw${sign(status.pitch)}`]
  const data = [Math.abs(status.pitch), Math.abs(status.roll), Math.abs(status.yaw)]

  return { titles, data }
}

const start = drone => {
  if (drone.getStatus() === {}) {
    throw Error('Drone not ready')
  }

  console.log(drone.getStatus())

  const screen = blessed.screen()
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })
  const donuts = grid.set(0, 0, 3, 4, contrib.donut, {
    label: 'Health',
    radius: 10,
    arcWidth: 3,
    remainColor: 'black',
    yPadding: 2,
  })
  const axisBars = grid.set(0, 4, 4, 4, contrib.bar, {
    label: 'Orientation',
    barWidth: 8,
    barSpacing: 4,
    xOffset: 0,
    maxHeight: 180,
  })

  screen.render()

  timer = setInterval(() => {
    donuts.setData(droneToDonuts(drone.getStatus()))
    axisBars.setData(droneToAxisBars(drone.getStatus()))
    screen.render()
  }, 16)
}

const stop = () => {}

export default { start, stop }