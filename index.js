let displayedItem = null;

function startup() {
	const input = document.querySelector('.tophalf .search input');

	input.addEventListener('focus', e => {
		document.querySelector('.tophalf').classList.remove('fullheight');
	});

	// I'm running this on Python's HTTP server; replace this with the appropriate location
	// if needed.
	fetch('front-end-task.json')
		.then(stream => stream.json())
		.then(data => {
			input.addEventListener('keypress', e => keyPressed(e, data));
			input.addEventListener('keydown', e => keyPressed(e, data));
		});
}

if (document.readyState === 'complete') {
	startup();
} else {
	document.addEventListener('DOMContentLoaded', startup);
}

let updateTimeout = -1;
function keyPressed(e, data) {
	if (e.type === "keydown" && e.key !== "Backspace") {
		return;
	}

	clearTimeout(updateTimeout);
	setTimeout(() => updateSuggestions(e.target.value, document.querySelector('.search .suggestions tbody'), data), 100);
}

function updateSuggestions(query, destination, data) {
	let count = 0;
	for (const child of [...destination.children]) {
		destination.removeChild(child);
	}

	query = query.toLowerCase();
	outer: for (const item of data) {
		for (const property of ['title', 'description', 'name']) {
			if (typeof item[property] === 'string' && item[property].toLowerCase().indexOf(query) >= 0) {
				addSuggestion(item, item[property], destination);
				if (++count === 4) {
					break outer;
				}

				break;
			}
		}
	}

	if (count == 0) {
		document.querySelector('.search').classList.remove('has-suggestions');
	} else {
		document.querySelector('.search').classList.add('has-suggestions');
	}
}

function addSuggestion(item, text, destination) {
	const row = document.createElement('tr');
	const iconCell = document.createElement('td');
	const icon = document.createElement('img');
	icon.src = `icons/${item.type}.svg`; // needs adjusting

	const textCell = document.createElement('td');
	textCell.textContent = text;

	iconCell.appendChild(icon);
	row.appendChild(iconCell);
	row.appendChild(textCell);
	destination.appendChild(row);

	row.addEventListener('click', e => activateSuggestion(item));
}

function activateSuggestion(item) {
	console.log("HERE");
	displayedItem = item;

	const avatar = document.createElement('img');
	avatar.classList.add('avatar');

	const details = document.createElement('dl');
	details.classList.add('item-details');
	for (const property of Object.getOwnPropertyNames(item)) {
		if (property === 'avatar' || property === 'type') {
			continue;
		}

		const title = document.createElement('dt');
		title.textContent = property;
		const content = document.createElement('dd');
		content.textContent = item[property];

		if (property.indexOf('name') >= 0) {
			content.classList.add('important');
		}

		details.appendChild(title);
		details.appendChild(content);
	}

	document.querySelector('.results').replaceChildren(avatar, details);
	document.querySelector('.search').classList.remove('has-suggestions');
}

