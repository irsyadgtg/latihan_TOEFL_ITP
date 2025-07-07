// File: new/shared/components/Confirm.jsx
import React, { useState } from 'react';

const Confirm = ({ 
    title, 
    description,
    cancelText = "BATAL",
    confirmText,
    confirmButtonType = "danger",
    onConfirm, // Function yang akan dijalankan
    children // Trigger element (button, etc)
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = () => setIsOpen(true);
    
    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
        }
    };

    const handleConfirm = async () => {
        if (!onConfirm) return;
        
        setIsLoading(true);
        
        try {
            await onConfirm();
            setIsOpen(false);
        } catch (error) {
            console.error('Confirmation action failed:', error);
            // Keep modal open on error
        } finally {
            setIsLoading(false);
        }
    };

    // Handle ESC key
    React.useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && !isLoading) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, isLoading]);

    const getConfirmButtonStyles = () => {
        switch (confirmButtonType) {
            case "danger":
                return "bg-yellow-500 text-white hover:bg-yellow-600";
            case "primary":
                return "bg-yellow-500 text-white hover:bg-yellow-600";
            case "success":
                return "bg-yellow-500 text-white hover:bg-yellow-600";
            case "warning":
                return "bg-yellow-500 text-white hover:bg-yellow-600";
            default:
                return "bg-yellow-500 text-white hover:bg-yellow-600";
        }
    };

    return (
        <>
            {/* Trigger Element - Clone with onClick */}
            {React.cloneElement(children, { onClick: handleOpen })}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
                        {/* Content */}
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {title}
                            </h3>
                            <div className="text-gray-600">
                                {description}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-gray-700 bg-white border-2 border-gray-400 hover:bg-gray-50 
                                         rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 
                                         disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium ${getConfirmButtonStyles()}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        MEMPROSES...
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Confirm;