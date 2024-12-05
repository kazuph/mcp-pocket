interface PocketConfig {
	consumerKey: string;
	accessToken: string;
}

interface PocketItem {
	item_id: string;
	resolved_title: string;
	given_title: string;
	resolved_url: string;
	excerpt: string;
}

interface PocketResponse {
	list: {
		[key: string]: PocketItem;
	};
}

/**
 * Pocket APIから最新の記事を取得します
 * @param config Pocket APIの認証情報
 * @param count 取得する記事の件数（デフォルト: 20件、最大20件まで）
 * @returns 記事のタイトル、URL、概要文を含む配列
 */
export async function getPocketList(config: PocketConfig, count = 20) {
	const response = await fetch("https://getpocket.com/v3/get", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
			"X-Accept": "application/json",
		},
		body: JSON.stringify({
			consumer_key: config.consumerKey,
			access_token: config.accessToken,
			count: Math.min(count, 20),
			sort: "newest",
			detailType: "complete",
		}),
	});

	if (!response.ok) {
		throw new Error(`Pocket API request failed: ${response.statusText}`);
	}

	const data = (await response.json()) as PocketResponse;
	const filteredList = Object.values(data.list).map((item) => ({
		title: item.resolved_title || item.given_title || "",
		url: item.resolved_url || "",
		excerpt: item.excerpt || "",
	}));

	return filteredList;
}
