import React, { lazy, Suspense, memo } from 'react';

// @note Lazy load html-react-parser to reduce initial bundle size
const HtmlParserComponent = lazy(() => 
  import('html-react-parser').then(module => ({
    default: ({ html, options }) => module.default(html, options)
  }))
);

/**
 * LazyHtmlParser - A component that lazy loads html-react-parser
 * This reduces the initial bundle size by ~20KB
 */
class LazyHtmlParser extends React.Component {
  render() {
    const { html, options, fallback = null } = this.props;
    
    return (
      <Suspense fallback={fallback}>
        <HtmlParserComponent html={html} options={options} />
      </Suspense>
    );
  }
}

export default memo(LazyHtmlParser); 