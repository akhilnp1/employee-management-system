
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Trash2, GripVertical } from 'lucide-react';
import { formsApi } from '@/lib/api';
import type { FormField, FieldType } from '@/types';
import { slugify } from '@/lib/utils';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text',     label: 'Text' },
  { value: 'number',   label: 'Number' },
  { value: 'email',    label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'date',     label: 'Date' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select',   label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio',    label: 'Radio' },
  { value: 'phone',    label: 'Phone' },
  { value: 'url',      label: 'URL' },
];

let counter = 0;
function makeField(): FormField & { _key: string } {
  counter++;
  return {
    _key: `f_${Date.now()}_${counter}`,
    label: '', field_name: '', field_type: 'text',
    placeholder: '', help_text: '', is_required: false, order: 0, options: [],
  };
}

function SortableRow({ field, index, onChange, onRemove }: {
  field: FormField & { _key: string };
  index: number;
  onChange: (i: number, updates: Partial<FormField>) => void;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field._key });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg mb-2 ${
        isDragging ? 'opacity-50 shadow-lg shadow-black/40' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>

      {/* Label input */}
      <input
        value={field.label}
        onChange={e =>
          onChange(index, {
            label: e.target.value,
            field_name: field.field_name || slugify(e.target.value),
          })
        }
        placeholder="Label"
        className="flex-1 bg-slate-900/60 border border-slate-600/60 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
      />

      {/* Type select */}
      <select
        value={field.field_type}
        onChange={e => onChange(index, { field_type: e.target.value as FieldType })}
        className="bg-slate-900/60 border border-slate-600/60 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors min-w-[160px]"
      >
        <option value="" disabled>Select Input Type</option>
        {FIELD_TYPES.map(t => (
          <option key={t.value} value={t.value} className="bg-slate-800">
            {t.label}
          </option>
        ))}
      </select>

      {/* Required checkbox */}
      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer whitespace-nowrap">
        <input
          type="checkbox"
          checked={field.is_required}
          onChange={e => onChange(index, { is_required: e.target.checked })}
          className="accent-primary-500 w-3.5 h-3.5"
        />
        Required
      </label>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-slate-500 hover:text-red-400 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const isEdit = params?.id && params.id !== 'new';
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState<(FormField & { _key: string })[]>([makeField()]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(!!isEdit);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (isEdit) {
      formsApi.getWithFields(Number(params.id)).then(r => {
        const form = r.data;
        setFormName(form.name);
        setFormDesc(form.description || '');
        setFields(
          form.fields.length > 0
            ? form.fields.map((f: FormField) => ({ ...f, _key: `f_${f.id || Date.now()}` }))
            : [makeField()],
        );
      }).finally(() => setInitialLoad(false));
    }
  }, [isEdit, params?.id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = fields.findIndex(f => f._key === active.id);
      const newIdx = fields.findIndex(f => f._key === over.id);
      setFields(arrayMove(fields, oldIdx, newIdx));
    }
  };

  const addField = () => setFields(prev => [...prev, makeField()]);
  const updateField = (index: number, updates: Partial<FormField>) =>
    setFields(prev => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  const removeField = (index: number) => {
    if (fields.length === 1) { toast.error('Form must have at least one field'); return; }
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error('Please enter a form name'); return; }
    if (fields.some(f => !f.label.trim())) { toast.error('All fields must have a label'); return; }
    setLoading(true);
    try {
      const payload = {
        name: formName, description: formDesc, is_active: true,
        fields: fields.map((f, i) => ({
          label: f.label,
          field_name: f.field_name || slugify(f.label),
          field_type: f.field_type,
          placeholder: f.placeholder || '',
          help_text: f.help_text || '',
          is_required: f.is_required,
          order: i,
          options: f.options || [],
        })),
      };
      if (isEdit) {
        await formsApi.update(Number(params.id), payload);
        toast.success('Form updated!');
      } else {
        await formsApi.create(payload);
        toast.success('Form created!');
      }
      router.push('/forms');
    } catch {
      toast.error('Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/forms" className="btn-secondary p-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Form' : 'New Form'}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Design your employee data collection form</p>
        </div>
      </div>

      {/* Form metadata */}
      <div className="glass-card p-5 space-y-3">
        <div>
          <label className="label-text">Form Name *</label>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. Onboarding Form"
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">Description (optional)</label>
          <input
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            placeholder="Brief description"
            className="input-field"
          />
        </div>
      </div>

      {/* Field builder — dark-themed container */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 min-h-[180px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(f => f._key)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <SortableRow
                  key={field._key}
                  field={field}
                  index={index}
                  onChange={updateField}
                  onRemove={removeField}
                />
              ))}
            </SortableContext>
          </DndContext>

          {fields.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">
              Click Add Field to start
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 w-28 flex-shrink-0">
          <button
            type="button"
            onClick={addField}
            className="w-full bg-slate-700/60 border border-slate-600/60 text-slate-200 hover:bg-slate-600/60 hover:border-slate-500 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
          >
            Add Field
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary-600 border border-primary-500 text-white hover:bg-primary-500 font-medium py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <p className="text-slate-500 text-xs">
        Tip: Drag the ⠿ handle on the left of each row to reorder fields
      </p>
    </div>
  );
}
