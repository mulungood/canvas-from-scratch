<script lang="ts">
	import { toKeyName } from 'is-hotkey'
	import TarotCard from './TarotCard.svelte'
	import { tarotCards } from './tarotCards'

	let entities = tarotCards

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
		| {
				initial: { x: number; y: number }
				current: { x: number; y: number }
				entitiesInBounds: string[]
		  } = undefined
	$: handlePointerMove = (event: PointerEvent) => {
		if (!leftMouseDown) return

		if (keysPressed[toKeyName('space')]) {
			const SPEED_FACTOR = 2
			// Move the canvas in the opposite direction of the mouse (* -1)
			// Faster movement when zoomed-out (zoom < 1)
			// Log to smooth out the difference
			console.log({ zoom: viewport.zoom, log: Math.log(viewport.zoom) + 2 })
			const delta = {
				x:
					(event.movementX * -1 * SPEED_FACTOR) / (Math.log(viewport.zoom) + 2),
				y:
					(event.movementY * -1 * SPEED_FACTOR) / (Math.log(viewport.zoom) + 2),
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
					entitiesInBounds: [],
				}
			}
			selectionBox.current = cursorPosition

			const selectionBbox = {
				minX: Math.min(selectionBox.initial.x, selectionBox.current.x),
				maxX: Math.max(selectionBox.initial.x, selectionBox.current.x),
				minY: Math.min(selectionBox.initial.y, selectionBox.current.y),
				maxY: Math.max(selectionBox.initial.y, selectionBox.current.y),
			}
			selectionBox.entitiesInBounds = entities.reduce((ids, entity) => {
				const entityBbox = {
					minX: entity.x,
					maxX: entity.x + entity.width,
					minY: entity.y,
					maxY: entity.y + entity.height,
				}
				if (
					// === X-axis ===
					// left-side to the left of the selection's right-side
					entityBbox.minX < selectionBbox.maxX &&
					// right-side to the right of the selection's left-side
					entityBbox.maxX > selectionBbox.minX &&
					// === Y-axis ===
					// top-side above selection's bottom-side
					entityBbox.minY < selectionBbox.maxY &&
					// bottom-side below selection's top-side
					entityBbox.maxY > selectionBbox.minY
				) {
					return [...ids, entity._id]
				}
				return ids
			}, [] as string[])
		}
	}
</script>

<svelte:window
	on:keydown={(event) => (keysPressed[event.key.toLowerCase()] = true)}
	on:keyup={(event) => (keysPressed[event.key.toLowerCase()] = false)}
/>

<main
	style="--zoom: {viewport.zoom};"
	data-pan-state={keysPressed[toKeyName('space')]
		? leftMouseDown
			? 'panning'
			: 'panneable'
		: 'none'}
	on:pointermove={handlePointerMove}
	on:pointerdown={(event) => {
		// Only start panning on left-click
		if (event.pointerType === 'mouse' && event.button === 0) {
			leftMouseDown = true
		}

		// @TODO: mobile
	}}
	on:pointerleave={() => {
		// @TODO: how to cancel selection when pointer is outside of the screen?
		console.info('pointerleave')
		selectionBox = undefined
	}}
	on:pointerup={() => {
		leftMouseDown = false
		if (!selectionBox) return

		selection = keysPressed[toKeyName('shift')]
			? [...(selection || []), ...selectionBox.entitiesInBounds]
			: selectionBox.entitiesInBounds
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
			<button
				class="box"
				style="width: {entity.width}px; height: {entity.height}px; transform: translate({normalizePosition(
					entity.x,
				)}px, {normalizePosition(entity.y)}px)"
				draggable="false"
				data-selected={selection.includes(entity._id)}
				data-being-selected={selectionBox?.entitiesInBounds.includes(
					entity._id,
				)}
				on:click|stopPropagation={() => {
					// Don't select when panning
					if (keysPressed[toKeyName('space')]) {
						return
					}
					// If entity already selected and SHIFT is pressed, un-select it
					if (
						selection.includes(entity._id) &&
						keysPressed[toKeyName('shift')]
					) {
						selection = selection.filter((id) => id !== entity._id)
					} else {
						// If not selected yet,
						selection = keysPressed[toKeyName('shift')]
							? // Add to selection if SHIFT is pressed
							  [...selection, entity._id]
							: // Or set it as the sole selection if otherwise
							  [entity._id]
					}
				}}
			>
				<span class="sr-only">Select box ({entity._id})</span>
				{#if entity._type === 'tarotCard'}
					<TarotCard {entity} />
				{/if}
			</button>
		{/each}
	</div>
</main>

<style>
	main {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
			Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

	main[data-pan-state='panneable'] {
		/* If not !important, the browser will have the cursor flickering as we drag */
		cursor: grab !important;
	}

	main[data-pan-state='panning'] {
		/* If not !important, the browser will have the cursor flickering as we drag */
		cursor: grabbing !important;
	}

	* {
		font-family: inherit;
		font-size: inherit;
	}

	.canvas,
	.box,
	.selectionBox {
		position: absolute;
		left: 0;
		top: 0;
	}

	.box {
		/* background: #f1f1f1; */
		/* border: 2px solid rgb(222, 222, 222); */
		transition: 0.075s ease-out border-color;
		cursor: inherit;
		user-select: none;
		perspective: 100px;
		padding: 0;
		border: none;
		background-color: transparent;
	}

	button {
		padding: 0;
	}

	.box[data-being-selected='true'] {
		/* border-color: rgba(71, 125, 252, 0.5); */
	}

	.box[data-selected='true'] {
		/* border-color: rgba(71, 125, 252, 1); */
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

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
