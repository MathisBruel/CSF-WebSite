'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Commencez à taper...',
}: {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose max-w-none focus:outline-none min-h-80 p-3 border border-gray-200 rounded-lg bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          title="Gras (Ctrl+B)"
        >
          <strong>G</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          title="Italique (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive('strike')}
          title="Barré"
        >
          <s>S</s>
        </ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor?.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          H3
        </ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
          title="Liste à puces"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
          title="Liste numérotée"
        >
          1.
        </ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive('codeBlock')}
          title="Bloc de code"
        >
          &lt;&gt;
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive('blockquote')}
          title="Citation"
        >
          &quot;
        </ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          title="Annuler"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          title="Refaire"
        >
          ↷
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-csf-orange text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
