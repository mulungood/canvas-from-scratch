<script>
	export let deck
	export let addEntity
</script>

<button
	on:click|stopPropagation={() => {
		const newCard = {
			width: deck.width * 0.8,
			height: deck.height * 0.8,
			// Use the deck's height
			y: deck.y + (deck.height * 0.2) / 2,
			// And 100px to the right
			x:
				deck.x +
				deck.width +
				100 +
				deck.width * 0.8 * deck.addedCards.length +
				(40 * deck.addedCards.length - 1),
			_id: `${Math.random().toString()}`,
			_type: 'tarotCard',
			cardFilename: deck.cardImages[0],
			side: 'back',
		}
		addEntity(newCard)
		deck.addedCards.push(newCard)
		deck.cardImages = deck.cardImages.slice(1)
	}}
>
	{#if deck.cardImages.length > 0}
		<img src={'/card-back.png'} alt="Card back" data-front />
	{/if}
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

	img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		user-select: none;
	}
</style>
