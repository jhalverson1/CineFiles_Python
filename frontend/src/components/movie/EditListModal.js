import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { variants } from '../../utils/theme';

const EditListModal = ({ isOpen, onClose, onUpdateList, list }) => {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (list) {
      setListName(list.name);
      setDescription(list.description || '');
    }
  }, [list]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { listName, description });
    if (!listName.trim()) {
      toast.error('List name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Calling onUpdateList with:', { id: list.id, data: { name: listName.trim(), description: description.trim() } });
      await onUpdateList(list.id, { name: listName.trim(), description: description.trim() });
      setListName('');
      setDescription('');
      onClose();
      toast.success('List updated successfully');
    } catch (error) {
      console.error('Error in EditListModal handleSubmit:', error);
      toast.error('Failed to update list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Edit List
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="listName" className="block text-sm font-medium mb-1">
                      List Name *
                    </label>
                    <input
                      type="text"
                      id="listName"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      className={`${variants.input.base} ${variants.input.focus}`}
                      placeholder="Enter list name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${variants.input.base} ${variants.input.focus}`}
                      placeholder="Enter list description"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`${variants.button.secondary.base} ${variants.button.secondary.hover}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`${variants.button.primary.base} ${variants.button.primary.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditListModal; 