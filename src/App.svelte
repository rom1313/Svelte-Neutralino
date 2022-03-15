<script>
	export let name;
</script>

<main>
	<h1>Hello gros fou</h1>
</main>

<style>
	@font-face {
		font-family: "scifi";
		src: url("/conthrax-sb.ttf");
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		font-family: "scifi";
		background-color: brown;
	}

	h1 {
		color: #000000;
		text-shadow: #002eac 1px 1px;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
