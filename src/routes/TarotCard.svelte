<script>
	export let entity
</script>

<button
	on:click|stopPropagation={() => {
		entity.side = entity.side === 'front' ? 'back' : 'front'
		status = 'flipping'
	}}
	data-side={entity.side}
>
	<img src={entity.front} alt="Card" data-front />
	<img src={entity.back} alt="Card" data-back />
</button>

<style>
	button {
		width: 100%;
		height: 100%;
		display: block;
		user-select: none;
		background-color: transparent;
		border: none;
	}

	button[data-status='flipping'] {
		transform: rotate3D(0, 0, 1);

		transition: transform 1s;
		transform-origin: center right;
		transform-style: preserve-3d;
	}

	img {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		user-select: none;
		position: absolute;
		backface-visibility: hidden;
		transition: transform 1s;
		transform-style: preserve-3d;
		transform-origin: center right;
	}

	button[data-side='front'] img[data-back],
	button[data-side='back'] img[data-front] {
		transform: translateX(-100%) rotateY(-180deg);
	}
</style>
