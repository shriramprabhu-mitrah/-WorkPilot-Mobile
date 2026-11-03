import React from 'react';
import { Text, View, Image } from 'react-native';

export const renderParsedHtml = (htmlString: string, baseStyle: any) => {
  if (!htmlString) {
    return null;
  }
  // Clean up HTML entities like &nbsp;
  const decodedHtml = htmlString
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  const parts = decodedHtml.split(/(<[^>]+>)/g);

  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isOrderedList = false;
  let listIndex = 0;

  let currentInlineElements: React.ReactNode[] = [];
  const blockElements: React.ReactNode[] = [];

  const flushInline = (key: string | number) => {
    if (currentInlineElements.length > 0) {
      blockElements.push(
        <Text
          key={`line-${key}`}
          numberOfLines={1}
          ellipsizeMode='tail'
          style={{
            marginBottom: 4,
          }}
        >
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
      const tag = part.toLowerCase();

      // Handle structural / line-break tags
      if (
        tag.startsWith('<br') ||
        tag.startsWith('</p') ||
        tag.startsWith('</div')
      ) {
        flushInline(index);
        return;
      }

      // Lists
      if (tag.startsWith('<ul')) {
        flushInline(index);
        isOrderedList = false;
        listIndex = 0;
        return;
      }

      if (tag.startsWith('<ol')) {
        flushInline(index);
        isOrderedList = true;
        listIndex = 0;
        return;
      }

      if (tag.startsWith('<li')) {
        flushInline(index);
        listIndex++;

        currentInlineElements.push(
          <Text key={`list-${index}`} style={baseStyle}>
            {isOrderedList ? `${listIndex}. ` : '• '}
          </Text>,
        );
        return;
      }
      if (tag.startsWith('</li')) {
        flushInline(index);
        return;
      }

      if (tag.startsWith('<img')) {
        const srcMatch = part.match(/src=["']([^"']+)["']/i);
        const src = srcMatch?.[1];
        if (src) {
          currentInlineElements.push(
            <Image
              key={`image-${index}`}
              source={{ uri: src }}
              style={{
                width: 220,
                height: 160,
                resizeMode: 'contain',
                marginVertical: 6,
                borderRadius: 8,
              }}
            />,
          );
        }
        return;
      }

      // Bold
      if (/^<(b|strong)(\s|>)/.test(tag)) {
        isBold = true;
      }
      if (/^<\/(b|strong)/.test(tag)) {
        isBold = false;
      }

      // Italic
      if (/^<(i|em)(\s|>)/.test(tag)) {
        isItalic = true;
      }
      if (/^<\/(i|em)/.test(tag)) {
        isItalic = false;
      }

      // Underline
      if (/^<u(\s|>)/.test(tag)) {
        isUnderline = true;
      }
      if (/^<\/u/.test(tag)) {
        isUnderline = false;
      }

      if (/^<h[1-6](\s|>)/.test(tag)) {
        flushInline(index);
        return;
      }

      if (/^<\/h[1-6]/.test(tag)) {
        flushInline(index);
        return;
      }

      return;
    }

    // Render text
    if (part.trim()) {
      currentInlineElements.push(
        <Text
          key={`text-${index}`}
          style={[
            baseStyle,
            isBold && { fontWeight: 'bold' },
            isItalic && { fontStyle: 'italic' },
            isUnderline && {
              textDecorationLine: 'underline',
            },
          ]}
        >
          {part}
        </Text>,
      );
    }
  });

  // Flush remaining elements
  flushInline('end');

  return <View style={{ flexDirection: 'column' }}>{blockElements}</View>;
};
