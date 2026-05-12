'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'

export function AdvancedRichEditor({
  value,
  onChange,
  placeholder = 'Commencez à taper...',
  maxWords = 10000,
}: {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  maxWords?: number
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      CharacterCount.configure({ limit: maxWords * 5 }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose max-w-none focus:outline-none min-h-96 p-4 bg-white overflow-auto',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      const text = editor.getText()
      setWordCount(text.split(/\s+/).filter(Boolean).length)
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 space-y-2">
        {/* Row 1 */}
        <div className="flex flex-wrap gap-1 items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Gras (Ctrl+B)"
            icon="🅱️"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italique (Ctrl+I)"
            icon="🅸️"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Barré"
            icon="S̶"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Souligné"
            icon="U̲"
          />
          <Separator />

          <select
            onChange={(e) => {
              if (e.target.value === 'p') {
                editor.chain().focus().setParagraph().run()
              } else {
                const level = parseInt(e.target.value)
                editor.chain().focus().setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
              }
            }}
            value={
              editor.isActive('heading', { level: 1 })
                ? '1'
                : editor.isActive('heading', { level: 2 })
                  ? '2'
                  : editor.isActive('heading', { level: 3 })
                    ? '3'
                    : 'p'
            }
            className="px-2.5 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <option value="p">Paragraphe</option>
            <option value="1">Titre 1</option>
            <option value="2">Titre 2</option>
            <option value="3">Titre 3</option>
            <option value="4">Titre 4</option>
          </select>

          <Separator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Liste"
            icon="•"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Liste numérotée"
            icon="1."
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code"
            icon="&lt;&gt;"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Citation"
            icon="❝"
          />

          <Separator />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Aligner à gauche"
            icon="⬅"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Centrer"
            icon="↔"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Aligner à droite"
            icon="➡"
          />

          <Separator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive('subscript')}
            title="Indice"
            icon="x₂"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive('superscript')}
            title="Exposant"
            icon="x²"
          />

          <Separator />

          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle')?.color || '#000000'}
            title="Couleur du texte"
            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          />

          <input
            type="color"
            onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
            value={editor.getAttributes('highlight')?.color || '#ffff00'}
            title="Surbrillance"
            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          />

          <Separator />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Annuler"
            icon="↶"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Refaire"
            icon="↷"
          />
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-1 items-center">
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('URL du lien:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            active={editor.isActive('link')}
            title="Ajouter lien"
            icon="🔗"
          />
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Retirer lien"
              icon="✕"
            />
          )}

          <ToolbarButton
            onClick={() => {
              const url = window.prompt('URL de l\'image:')
              if (url) {
                editor.chain().focus().setImage({ src: url }).run()
              }
            }}
            title="Insérer image"
            icon="🖼️"
          />


          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            >
              {showPreview ? '✎ Édition' : '👁️ Aperçu'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      {!showPreview ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="prose prose-sm sm:prose max-w-none p-4 min-h-96 overflow-auto bg-white">
          <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
        </div>
      )}

      {/* Footer Stats */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-csf-muted">
        <div className="flex gap-4">
          <span>Mots: {wordCount}</span>
          <span>Caractères: {editor.storage.characterCount?.characters() || 0}</span>
        </div>
        <div className="text-right">
          {wordCount > maxWords && <span className="text-red-600">⚠️ Limite de mots dépassée!</span>}
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  icon,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  icon: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1.5 rounded text-sm font-medium transition-all ${
        active
          ? 'bg-csf-orange text-white shadow-sm'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
      }`}
    >
      {icon}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />
}
