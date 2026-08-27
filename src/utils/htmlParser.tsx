import React from 'react';
import { Text, View } from 'react-native';

export const renderParsedHtml = (htmlString: string, baseStyle: any) => {
  if (!htmlString) {
    return null;
  }
  // Clean up HTML entities like &nbsp;
  const decodedHtml = htmlString.replace(/&nbsp;/g, ' ');

  // Split text by any HTML tag (including those with inline styles like <span style="...">, <b style="...">, etc.)
  const parts = decodedHtml.split(/(<\/?[a-z0-9]+[^>]*>)/gi);

  let isBold = false;
  let isItalic = false;
  let isUnderline = false;

  let currentInlineElements: React.ReactNode[] = [];
  let blockElements: React.ReactNode[] = [];

  const flushInline = (key: string | number) => {
    if (currentInlineElements.length > 0) {
      blockElements.push(
        <Text key={`line-${key}`} style={{ marginBottom: 4 }}>
          {currentInlineElements}
        </Text>,
      );
      currentInlineElements = [];
    }
  };

  parts.forEach((part, index) => {
    if (!part) {
      return;
    }

    // Check if it is an HTML tag
    if (part.startsWith('<') && part.endsWith('>')) {
      const lower = part.toLowerCase();

      // Handle structural / line-break tags
      if (
        lower.startsWith('<br') ||
        lower.startsWith('</p>') ||
        lower.startsWith('</div>')
      ) {
        flushInline(index);
        return;
      }
      if (lower.startsWith('<li')) {
        currentInlineElements.push(
          <Text key={`bullet-${index}`} style={baseStyle}>
            •{' '}
          </Text>,
        );
        return;
      }
      if (lower.startsWith('</li')) {
        flushInline(index);
        return;
      }

      // Check for bold styles or tags
      if (
        lower.includes('<b>') ||
        lower.includes('<strong>') ||
        lower.includes('font-weight: bold') ||
        lower.includes('font-weight:bolder') ||
        lower.includes('font-weight: 700')
      ) {
        isBold = true;
      }
      if (lower.startsWith('</b') || lower.startsWith('</strong')) {
        isBold = false;
      }

      // Check for italic styles or tags
      if (
        lower.includes('<i>') ||
        lower.includes('<em>') ||
        lower.includes('font-style: italic')
      ) {
        isItalic = true;
      }
      if (lower.startsWith('</i') || lower.startsWith('</em')) {
        isItalic = false;
      }

      // Check for underline styles or tags
      if (
        lower.includes('<u>') ||
        lower.includes('text-decoration: underline')
      ) {
        isUnderline = true;
      }
      if (lower.startsWith('</u')) {
        isUnderline = false;
      }

      return;
    }

    // Render normal text content with active styles
    currentInlineElements.push(
      <Text
        key={index}
        style={[
          baseStyle,
          isBold && { fontWeight: 'bold' },
          isItalic && { fontStyle: 'italic' },
          isUnderline && { textDecorationLine: 'underline' },
        ]}
      >
        {part}
      </Text>,
    );
  });

  // Flush remaining elements
  flushInline('end');

  return <View style={{ flexDirection: 'column' }}>{blockElements}</View>;
};
