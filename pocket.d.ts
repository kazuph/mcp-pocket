interface PocketConfig {
	consumerKey: string;
	accessToken: string;
}

interface PocketArticle {
	title: string;
	url: string;
	excerpt: string;
}

export function getPocketList(
	config: PocketConfig,
	count?: number,
): Promise<PocketArticle[]>;
