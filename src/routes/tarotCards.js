const cardNames = [
	'0 The Fool.png',
	'1 The Magician.png',
	'2 The High Priestess.png',
	'3 The Empress.png',
	'4 The Emperor.png',
	'5 The Hierophant.png',
	'6 The Lovers.png',
	'7 Chariot.png',
	'8 Justice.png',
	'9 Hermit.png',
	'10 Wheel of Fortune.png',
	'11 Strength.png',
	'12 The Hanged Man.png',
	'13 Death.png',
	'14 Temperance.png',
	'15 The Devil.png',
	'16 The Tower.png',
	'17 The Star.png',
	'18 The Moon.png',
	'19 The Sun.png',
	'20 Judgement.png',
	'21 The World.png',
]

export const tarotCards = [
	...cardNames.flatMap((card, idx, arr) => {
		if (idx % 2 === 0) return []
		return [
			{
				y: 0,
				x: 0 + 20 * idx + 512 * (idx + 1),
				width: 512,
				height: 768,
				_id: card,
				_type: 'tarotCard',
				front: `/nagle-arcana/${card}`,
				back: `/nagle-arcana/${arr[idx + 1]}`,
			},
		]
	}),
	{
		_type: 'tarotDeck',
		y: 800,
		x: 0,
		width: 512,
		height: 768,
		_id: 'nagleArcana',
		cardsImages: cardNames,
		curCard: 0,
	},
]
