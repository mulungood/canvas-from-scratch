<script lang="ts">
	const entities = [
		{
			_type: 'box',
			width: 400,
			height: 400,
			position: {
				x: 50,
				y: 50,
			},
		},
		{
			_type: 'box',
			width: 200,
			height: 400,
			position: {
				x: 500,
				y: 50,
			},
		},
		{
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
</script>

<main style="--zoom: {viewport.zoom};">
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
		class="canvas"
		style="width: {CANVAS_SIZE}px; height: {CANVAS_SIZE}px; transform: translate({normalizePosition(
			viewport.x,
		) * -1}px, {normalizePosition(viewport.y) * -1}px) scale({viewport.zoom});"
	>
		{#each entities as entity}
			<div
				class="box"
				style="width: {entity.width}px; height: {entity.height}px; transform: {getEntityTransform(
					entity,
				)}"
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
			/* lighter background on higher zoom levels */
				rgba(191, 191, 191, var(--zoom)) 1px,
			rgba(0, 0, 0, 0) 1px
		);
		height: 100vh;
		overflow: hidden;
	}

	.canvas,
	.box {
		position: absolute;
		left: 0;
		top: 0;
	}

	.box {
		background: #ececec;
	}

	form {
		position: absolute;
		left: 0;
		bottom: 0;
		background-color: white;
		z-index: 50;
	}
</style>
