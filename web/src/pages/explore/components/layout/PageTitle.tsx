type PageTitleProps = {
	title: string;
	description: string;
};

const PageTitle = ({ title, description }: PageTitleProps) => {
	return (
		<div className="text-center mb-16">
			<h1 className="text-4xl font-bold mb-4 text-gray-900">{title}</h1>
			<p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
		</div>
	);
};

export default PageTitle;
