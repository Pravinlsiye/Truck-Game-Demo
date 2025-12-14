# Custom Map Creation Guide

You can create custom maps for Truck Parking Pro using DXF files from CAD software like AutoCAD, LibreCAD, or any other CAD program.

## How to Create a Map

### 1. Drawing Walls and Obstacles

Draw your map using these shapes:
- **Lines** → Converted to walls
- **Polylines/Rectangles** → Converted to filled obstacles
- **Circles** → Converted to cones

### 2. Layer Names (Optional)

Use these layer names to control obstacle types:
- `WALL` or default → Gray walls
- `BARRIER` or `HAZARD` → Yellow/black striped barriers
- `CAR` or `VEHICLE` → Parked cars
- `CONE` → Traffic cones
- `TRAILER` → Parked trailers
- `PARKING` or `TARGET` → Parking zone (where to park)
- `TRUCK` or `START` → Truck starting position

### 3. Scale

The map will automatically scale to fit the game canvas (1200x800).
Draw your map at any scale - it will be adjusted automatically.

### 4. Export as DXF

Save/export your drawing as a `.dxf` file (ASCII format recommended).

## Example Map Layout

```
+------------------------------------------+
|                                          |
|  [WALL]              [PARKING ZONE]      |
|  ██████                  ████            |
|  ██████                  ████            |
|                                          |
|      ⚫ CONE                             |
|                                          |
|            [CAR]                         |
|            ███                           |
|                                          |
|                   🚛 TRUCK START         |
|                                          |
+------------------------------------------+
```

## Loading Your Map

1. Click "LOAD MAP" on the title screen
2. Select your .dxf file
3. The game will load and start with your custom map!

## Tips

- Keep the map open enough for the truck + trailer to navigate
- Remember the trailer is ~160 units long
- Test your map to ensure it's completable
- Add cones to guide the player

