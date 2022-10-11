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
</script>

<main>
	{#each entities as entity}
		<div
			class="box"
			style="width: {entity.width}px; height: {entity.height}px; transform: translate({entity
				.position.x}px, {entity.position.y}px)"
		/>
	{/each}
</main>

<style>
	main {
		position: relative;
		background-size: 40px 40px;
		background-image: radial-gradient(
			circle,
			rgb(191, 191, 191) 1px,
			rgba(0, 0, 0, 0) 1px
		);
		height: 100vh;
		overflow: hidden;
	}

	.box {
		position: absolute;
		left: 0;
		top: 0;
		background: #ececec;
	}
</style>
