'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef, useEffect } from 'react'

declare global {
  interface Window {
    tinymce?: unknown
  }
}

export function TinyMCEEditor({
  value,
  onChange,
  placeholder = 'Commencez à taper...',
  height = 500,
  maxWords = 10000,
}: {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  maxWords?: number
}) {
  const editorRef = useRef<any>(null)
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

  useEffect(() => {
    console.log('TinyMCEEditor - API Key:', apiKey ? '✓ Set' : '✗ Missing')
  }, [apiKey])

  return (
    <Editor
      onInit={(evt, editor) => {
        editorRef.current = editor
      }}
      value={value}
      onEditorChange={(content) => onChange(content)}
      apiKey={apiKey}
      init={{
        height,
        menubar: true,
        plugins: [
          // Text formatting
          'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen',
          // Media & content
          'insertdatetime media table paste code help wordcount',
          // Advanced formatting
          'emoticons autosave directionality textpattern nonbreaking pagebreak quickbars codesample',
          // Layout & design
          'formatpainter hr pagebreak tableofcontents',
          // Extended features
          'save autoresize imagetools',
        ],
        toolbar: [
          // Row 1: Essential
          { name: 'history', items: ['undo', 'redo'] },
          { name: 'styles', items: ['styles'] },

          // Row 2: Formatting
          { name: 'formatting', items: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'] },

          // Row 3: Lists & alignment
          { name: 'alignment', items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify'] },
          { name: 'lists', items: ['bullist', 'numlist', 'outdent', 'indent'] },

          // Row 4: Colors & background
          { name: 'colors', items: ['forecolor', 'backcolor'] },

          // Row 5: Content insertion (Images & Links)
          { name: 'insert', items: ['link', 'image', 'media', 'table', 'hr', 'pagebreak', 'codesample', 'emoticons'] },

          // Row 6: Advanced tools
          { name: 'tools', items: ['removeformat', 'formatpainter', 'code', 'fullscreen', 'preview', 'help'] },
        ],

        style_formats: [
          { title: 'Heading 1', format: 'h1' },
          { title: 'Heading 2', format: 'h2' },
          { title: 'Heading 3', format: 'h3' },
          { title: 'Heading 4', format: 'h4' },
          { title: 'Heading 5', format: 'h5' },
          { title: 'Heading 6', format: 'h6' },
          { title: 'Paragraph', format: 'p' },
          { title: 'Blockquote', format: 'blockquote' },
          { title: 'Preformatted', format: 'pre' },
          { title: 'Code', inline: 'code' },
          { title: 'Highlight', inline: 'mark' },
          { title: 'Emphasis', inline: 'em' },
          { title: 'Strong', inline: 'strong' },
        ] as any,

        content_style:
          'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; font-size: 14px; line-height: 1.6; color: #333; }' +
          'img { max-width: 100%; height: auto; border-radius: 4px; }' +
          'a { color: #f97316; text-decoration: none; }' +
          'a:hover { text-decoration: underline; }' +
          'blockquote { border-left: 4px solid #f97316; padding-left: 1em; margin-left: 0; color: #666; font-style: italic; }' +
          'code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }' +
          'pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }' +
          'table { border-collapse: collapse; width: 100%; }' +
          'table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }' +
          'table th { background: #f5f5f5; font-weight: bold; }' +
          'h1, h2, h3, h4, h5, h6 { color: #1f2937; margin-top: 0.5em; margin-bottom: 0.5em; }' +
          'mark { background: #fef08a; color: #000; }',

        setup: (editor) => {
          editor.on('init', () => {
            editor.setContent(value)
          })
        },

        placeholder,

        // ═══════════════════════════════════════════════════════════════════════════
        // IMAGE SETTINGS - Gestion complète des images
        // ═══════════════════════════════════════════════════════════════════════════
        paste_as_text: false,
        paste_data_images: true,
        automatic_uploads: true,
        file_picker_types: 'image',

        // Advanced image options
        image_caption: true,
        image_title: true,
        image_description: true,
        image_dimensions: true,
        image_list: [],
        image_advtab: true, // Show advanced tab with alt text, etc.

        // Image upload handler
        images_upload_handler: async (blobInfo, progress) => {
          return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append('file', blobInfo.blob(), blobInfo.filename())

            const xhr = new XMLHttpRequest()
            xhr.withCredentials = false

            xhr.upload.onprogress = (e) => {
              progress((e.loaded / e.total) * 100)
            }

            xhr.onload = () => {
              if (xhr.status === 201) {
                const json = JSON.parse(xhr.responseText)
                resolve(json.location)
              } else {
                reject('Échec du téléchargement d\'image')
              }
            }

            xhr.onerror = () => {
              reject('Erreur réseau lors du téléchargement')
            }

            xhr.open('POST', '/api/upload/image', true)
            xhr.send(formData)
          })
        },

        // Image dialog customization
        image_class_list: [
          { title: 'Responsive', value: 'img-responsive' },
          { title: 'Border', value: 'img-border' },
          { title: 'Shadow', value: 'img-shadow' },
          { title: 'Rounded', value: 'img-rounded' },
        ],

        // ═══════════════════════════════════════════════════════════════════════════
        // LINK SETTINGS - Gestion avancée des liens
        // ═══════════════════════════════════════════════════════════════════════════
        link_default_protocol: 'https://',
        link_class_list: [
          { title: 'Aucune classe', value: '' },
          { title: 'Button Primary', value: 'btn-primary' },
          { title: 'Button Secondary', value: 'btn-secondary' },
          { title: 'Button Outline', value: 'btn-outline' },
        ],
        target_list: [
          { title: 'Même fenêtre', value: '' },
          { title: 'Nouvelle fenêtre', value: '_blank' },
          { title: 'Frame parent', value: '_parent' },
          { title: 'Top frame', value: '_top' },
        ],
        link_list: [],

        // ═══════════════════════════════════════════════════════════════════════════
        // CODE EDITOR - Éditeur de code source
        // ═══════════════════════════════════════════════════════════════════════════
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'CSS', value: 'css' },
          { text: 'PHP', value: 'php' },
          { text: 'Ruby', value: 'ruby' },
          { text: 'Python', value: 'python' },
          { text: 'Java', value: 'java' },
          { text: 'C', value: 'c' },
          { text: 'C++', value: 'cpp' },
          { text: 'SQL', value: 'sql' },
          { text: 'Bash', value: 'bash' },
          { text: 'JSON', value: 'json' },
          { text: 'TypeScript', value: 'typescript' },
        ],

        // ═══════════════════════════════════════════════════════════════════════════
        // TABLE FEATURES
        // ═══════════════════════════════════════════════════════════════════════════
        table_default_attributes: {
          border: '1'
        },
        table_default_styles: {
          borderCollapse: 'collapse',
          width: '100%'
        },
        table_responsive_width: true,
        table_class_list: [
          { title: 'Aucune', value: '' },
          { title: 'Striped', value: 'table-striped' },
          { title: 'Bordered', value: 'table-bordered' },
          { title: 'Hover', value: 'table-hover' },
        ],

        // ═══════════════════════════════════════════════════════════════════════════
        // EDITOR FEATURES
        // ═══════════════════════════════════════════════════════════════════════════
        branding: false,
        statusbar: true,
        relative_urls: false,
        convert_urls: false,
        language: 'fr_FR',

        // Undo/Redo
        undo_levels: 100,

        // Content filtering & security
        valid_elements: 'p,br,strong/b,em/i,u,h1,h2,h3,h4,h5,h6,blockquote,ol,ul,li,a[href|title|target|rel|class],img[src|alt|title|width|height|style|class|loading],table,tr,th,td,code,pre,hr,mark,span[style|class],div[style|class],iframe[src|frameborder|allow|allowfullscreen],video[src|controls|width|height],audio[src|controls],figure,figcaption',

        // Extended valid attributes
        extended_valid_elements: 'iframe[src|frameborder|allowfullscreen|allow|style|width|height|loading],img[loading|decoding]',

        // Auto-save
        autosave_ask_before_unload: true,

        // Resize
        autoresize_bottom_margin: 20,
        autoresize_min_height: height,
        autoresize_max_height: 1000,

        // Mentions & smart behavior
        entity_encoding: 'named',

        // Custom toolbar groups
        toolbar_mode: 'wrap',
      }}
    />
  )
}
