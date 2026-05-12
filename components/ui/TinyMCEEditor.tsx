'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

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
}: {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
}) {
  const editorRef = useRef<any>(null)
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

  return (
    <Editor
      onInit={(_evt, editor) => {
        editorRef.current = editor
      }}
      initialValue={value || ''}
      onEditorChange={(content) => onChange(content)}
      apiKey={apiKey}
      init={{
        height,
        menubar: true,

        // TinyMCE 8: plugins as a single space-separated string
        plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount emoticons autosave directionality nonbreaking pagebreak quickbars codesample autoresize',

        // Toolbar groups
        toolbar: [
          { name: 'history', items: ['undo', 'redo'] },
          { name: 'styles', items: ['styles'] },
          { name: 'formatting', items: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'] },
          { name: 'alignment', items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify'] },
          { name: 'lists', items: ['bullist', 'numlist', 'outdent', 'indent'] },
          { name: 'colors', items: ['forecolor', 'backcolor'] },
          { name: 'insert', items: ['link', 'image', 'media', 'table', 'hr', 'pagebreak', 'codesample', 'charmap', 'emoticons'] },
          { name: 'tools', items: ['removeformat', 'code', 'fullscreen', 'preview', 'help'] },
        ],

        // Styles dropdown
        style_formats: [
          { title: 'Titre 1', format: 'h1' },
          { title: 'Titre 2', format: 'h2' },
          { title: 'Titre 3', format: 'h3' },
          { title: 'Titre 4', format: 'h4' },
          { title: 'Titre 5', format: 'h5' },
          { title: 'Titre 6', format: 'h6' },
          { title: 'Paragraphe', format: 'p' },
          { title: 'Citation', format: 'blockquote' },
          { title: 'Code', inline: 'code' },
          { title: 'Surligné', inline: 'mark' },
        ] as any,

        // Content styling
        content_style:
          'body { font-family: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; line-height: 1.6; color: #1A1A1A; padding: 8px 12px; }' +
          'img { max-width: 100%; height: auto; border-radius: 4px; }' +
          'a { color: #d28342; text-decoration: none; }' +
          'a:hover { text-decoration: underline; }' +
          'blockquote { border-left: 4px solid #d28342; padding-left: 1em; margin-left: 0; color: #666; font-style: italic; }' +
          'code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }' +
          'pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }' +
          'table { border-collapse: collapse; width: 100%; }' +
          'table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }' +
          'table th { background: #f5f5f5; font-weight: bold; }' +
          'h1, h2, h3, h4, h5, h6 { font-family: "Lora", Georgia, serif; color: #183546; margin-top: 0.5em; margin-bottom: 0.5em; }' +
          'mark { background: #fef08a; color: #000; }',

        placeholder,

        // ═══════════════════════════════════════════════════════════════
        // IMAGE SETTINGS
        // ═══════════════════════════════════════════════════════════════
        paste_data_images: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        image_caption: true,
        image_title: true,
        image_dimensions: true,
        image_advtab: true,
        image_class_list: [
          { title: 'Aucune', value: '' },
          { title: 'Responsive', value: 'img-responsive' },
          { title: 'Bordure', value: 'img-border' },
          { title: 'Ombre', value: 'img-shadow' },
          { title: 'Arrondi', value: 'img-rounded' },
        ],

        images_upload_handler: (blobInfo: any, progress: any) => {
          return new Promise<string>((resolve, reject) => {
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
                reject('Image upload failed')
              }
            }

            xhr.onerror = () => reject('Network error')

            xhr.open('POST', '/api/upload/image', true)
            xhr.send(formData)
          })
        },

        // ═══════════════════════════════════════════════════════════════
        // LINK SETTINGS
        // ═══════════════════════════════════════════════════════════════
        link_default_protocol: 'https',
        link_class_list: [
          { title: 'Aucune', value: '' },
          { title: 'Bouton principal', value: 'btn-primary' },
          { title: 'Bouton secondaire', value: 'btn-secondary' },
        ],
        target_list: [
          { title: 'Même fenêtre', value: '' },
          { title: 'Nouvelle fenêtre', value: '_blank' },
        ],

        // ═══════════════════════════════════════════════════════════════
        // CODE SAMPLES
        // ═══════════════════════════════════════════════════════════════
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'CSS', value: 'css' },
          { text: 'PHP', value: 'php' },
          { text: 'Python', value: 'python' },
          { text: 'Java', value: 'java' },
          { text: 'SQL', value: 'sql' },
          { text: 'Bash', value: 'bash' },
          { text: 'JSON', value: 'json' },
          { text: 'TypeScript', value: 'typescript' },
        ],

        // ═══════════════════════════════════════════════════════════════
        // TABLE
        // ═══════════════════════════════════════════════════════════════
        table_default_attributes: { border: '1' },
        table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
        table_class_list: [
          { title: 'Aucune', value: '' },
          { title: 'Striped', value: 'table-striped' },
          { title: 'Bordered', value: 'table-bordered' },
        ],

        // ═══════════════════════════════════════════════════════════════
        // GENERAL
        // ═══════════════════════════════════════════════════════════════
        branding: false,
        statusbar: true,
        relative_urls: false,
        convert_urls: false,
        language: 'fr',
        promotion: false,

        // Undo
        undo_levels: 100,

        // Auto-save
        autosave_ask_before_unload: true,

        // Autoresize
        autoresize_bottom_margin: 20,
        min_height: height,
        max_height: 1000,

        // Toolbar mode
        toolbar_mode: 'wrap',

        // Allow all valid HTML
        extended_valid_elements: 'iframe[src|frameborder|allowfullscreen|allow|style|width|height]',
        entity_encoding: 'named' as const,
      }}
    />
  )
}
