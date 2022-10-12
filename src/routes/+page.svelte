<script lang="ts">
	import { toKeyName } from 'is-hotkey'

	const entities = [
		{
			_id: 'box-1',
			_type: 'box',
			width: 400,
			height: 400,
			position: {
				x: 50,
				y: 50,
			},
		},
		{
			_id: 'box-2',
			_type: 'box',
			width: 200,
			height: 400,
			position: {
				x: 500,
				y: 50,
			},
		},
		{
			_id: 'box-3',
			_type: 'box',
			width: 400,
			height: 200,
			position: {
				x: 500,
				y: 500,
			},
		},
	]

	// Huge canvas to allow for moving to the top-left
	const CANVAS_SIZE = 10000
	let viewport = {
		x: 0,
		y: 0,
		zoom: 1,
	}
	// [min, max]
	const VIEWPORT_BOUNDS = [(CANVAS_SIZE * -1) / 2, CANVAS_SIZE / 2]
	const ZOOM_BOUNDS = [0.15, 5]

	// From 0-based positions to final position in viewport
	function normalizePosition(pos: number) {
		return pos + CANVAS_SIZE / 2
	}

	function getEntityTransform(entity: typeof entities[0]) {
		return `translate(${normalizePosition(
			entity.position.x,
		)}px, ${normalizePosition(entity.position.y)}px)`
	}

	/**
	 * Records keys being currently pressed for usage in user interactions.
	 */
	let keysPressed: Record<string, boolean> = {}

	/**
	 * Follows the browser's & Figma's patterns:
	 *
	 * - SHIFT + scroll = moving on the x-axis
	 * - SPACE + scroll = moving on the y-axis
	 * - CMD + scroll = zooming in and out (browser pattern)
	 */
	$: handleWheel = (event: WheelEvent) => {
		if (event.shiftKey) {
			const deltaXLog = Math.log(Math.abs(event.deltaX))
			const directionX = event.deltaX < 0 ? 1 : -1
			viewport.x = Math.min(
				VIEWPORT_BOUNDS[1],
				Math.max(viewport.x + deltaXLog * 30 * directionX, VIEWPORT_BOUNDS[0]),
			)
			return
		}

		const deltaYLog = Math.log(Math.abs(event.deltaY))
		const directionY = event.deltaY < 0 ? 1 : -1

		if (keysPressed[toKeyName('space')]) {
			viewport.y = Math.min(
				VIEWPORT_BOUNDS[1],
				Math.max(viewport.y + deltaYLog * 30 * directionY, VIEWPORT_BOUNDS[0]),
			)
			return
		}

		if (keysPressed[toKeyName('mod')]) {
			event.preventDefault()
			viewport.zoom = Math.min(
				ZOOM_BOUNDS[1],
				Math.max(viewport.zoom + deltaYLog * 0.1 * directionY, ZOOM_BOUNDS[0]),
			)
			return
		}
	}

	let leftMouseDown = false
	let selection: string[] = []
	let selectionBox:
		| undefined
		| { initial: { x: number; y: number }; current: { x: number; y: number } } =
		undefined
	$: handlePointerMove = (event: PointerEvent) => {
		if (!leftMouseDown) return

		if (keysPressed[toKeyName('space')]) {
			const SPEED_FACTOR = 2
			// Move the canvas in the opposite direction of the mouse (* -1)
			// Faster movement when zoomed-out (zoom < 1)
			// Log to smooth out the difference
			const delta = {
				x:
					(event.movementX * -1 * SPEED_FACTOR) / (Math.log(viewport.zoom) + 1),
				y:
					(event.movementY * -1 * SPEED_FACTOR) / (Math.log(viewport.zoom) + 1),
			}
			viewport.x = Math.min(
				VIEWPORT_BOUNDS[1],
				Math.max(viewport.x + delta.x, VIEWPORT_BOUNDS[0]),
			)
			viewport.y = Math.min(
				VIEWPORT_BOUNDS[1],
				Math.max(viewport.y + delta.y, VIEWPORT_BOUNDS[0]),
			)
		} else {
			const cursorPosition = {
				x: event.clientX + viewport.x,
				y: event.clientY + viewport.y,
			}
			if (!selectionBox) {
				selectionBox = {
					initial: cursorPosition,
					current: cursorPosition,
				}
			}
			selectionBox.current = cursorPosition
		}
	}
</script>

<svelte:window
	on:keydown={(event) => (keysPressed[event.key.toLowerCase()] = true)}
	on:keyup={(event) => (keysPressed[event.key.toLowerCase()] = false)}
/>

<main
	style="--zoom: {viewport.zoom};"
	on:pointermove={handlePointerMove}
	on:pointerdown={(event) => {
		// Only start panning on left-click
		if (event.pointerType === 'mouse' && event.button === 0) {
			leftMouseDown = true
		}

		// @TODO: mobile
	}}
	on:pointerup={() => {
		leftMouseDown = false
		selectionBox = undefined
	}}
>
	<form>
		<label>
			x
			<input
				type="range"
				bind:value={viewport.x}
				min={VIEWPORT_BOUNDS[0]}
				max={VIEWPORT_BOUNDS[1]}
			/>
		</label>
		<label>
			y
			<input
				type="range"
				bind:value={viewport.y}
				min={VIEWPORT_BOUNDS[0]}
				max={VIEWPORT_BOUNDS[1]}
			/>
		</label>
		<label>
			Zoom
			<input
				type="range"
				bind:value={viewport.zoom}
				min={ZOOM_BOUNDS[0]}
				max={ZOOM_BOUNDS[1]}
				step={0.25}
			/>
		</label>
	</form>
	<div
		on:wheel={handleWheel}
		data-panneable={!!keysPressed[toKeyName('space')]}
		class="canvas"
		style="width: {CANVAS_SIZE}px; height: {CANVAS_SIZE}px; transform: translate({normalizePosition(
			viewport.x,
		) * -1}px, {normalizePosition(viewport.y) * -1}px) scale({viewport.zoom});"
	>
		{#if selectionBox}
			<div
				class="selectionBox"
				style="width: {Math.abs(
					selectionBox.initial.x - selectionBox.current.x,
				)}px; height: {Math.abs(
					selectionBox.initial.y - selectionBox.current.y,
				)}px; transform: translate({normalizePosition(
					Math.min(selectionBox.initial.x, selectionBox.current.x),
				)}px, {normalizePosition(
					Math.min(selectionBox.initial.y, selectionBox.current.y),
				)}px)"
			/>
		{/if}
		{#each entities as entity}
			<div
				class="box"
				style="width: {entity.width}px; height: {entity.height}px; transform: {getEntityTransform(
					entity,
				)}"
				draggable="false"
			/>
		{/each}
	</div>
</main>

<style>
	main {
		position: relative;
		--bg-size: calc(var(--zoom) * 60px);
		background-size: var(--bg-size) var(--bg-size);
		background-image: radial-gradient(
			circle,
			/* lighter background on zoom-out (zoom < 1) */
				rgba(191, 191, 191, var(--zoom)) 1px,
			rgba(0, 0, 0, 0) 1px
		);
		height: 100vh;
		overflow: hidden;
	}

	.canvas,
	.box,
	.selectionBox {
		position: absolute;
		left: 0;
		top: 0;
	}

	.canvas[data-panneable='true'] {
		/* If not !important, the browser will have the cursor flickering as we drag */
		cursor: grab !important;
	}

	.box {
		background: #ececec;
	}

	.selectionBox {
		background: rgba(71, 125, 252, 0.15);
		border: 1px solid rgba(71, 125, 252, 1);
		z-index: 10;
	}

	form {
		position: absolute;
		left: 0;
		bottom: 0;
		background-color: white;
		z-index: 50;
	}
</style>
