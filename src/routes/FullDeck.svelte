<script>
	export let entity
</script>

<button
	on:click|stopPropagation={() => {
		entity.curCard += 1
		entity.curCard %= entity.cardImages.length - 1
	}}
>
	{#each entity.cardImages as fileName, idx}
		<div class="card" data-active={entity.curCard === idx}>
			<img src="/nagle-arcana/{fileName}" alt={fileName} />
			<h2>{fileName.replace(/\d/g, '').trim().split('.')[0]}</h2>
		</div>
	{/each}
</button>

<style>
	button {
		width: 100%;
		height: 100%;
		display: block;
		user-select: none;
		background-color: transparent;
		border: none;
		cursor: pointer;
	}

	.card {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		user-select: none;
		position: absolute;
		backface-visibility: hidden;
		transition: transform 0.55s ease-out;
		transform-style: preserve-3d;
		transform-origin: center right;
	}

	img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		user-select: none;
	}

	.card[data-active='false'] {
		transform: translateX(-100%) rotateY(-180deg);
	}
</style>
