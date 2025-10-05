import React from 'react';
import { FileUp } from 'lucide-react';

export default function InputSection({ userText, setUserText, handleFileChange, fileStatus }) {
  return (
    <div>
      <div className="mb-4">
        <label htmlFor="file-upload" className="custom-file-upload">
          <FileUp size={20} />
          <span>Upload a File (.pdf, .docx)</span>
        </label>
        <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
        <p className="text-sm text-pink-200/80 mt-2 h-5">{fileStatus}</p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="user-text" className="block text-lg font-semibold mb-2 text-pink-100">Or Paste Your Study Material</label>
        {/* Updated this textarea with a darker background and white text */}
        <textarea 
          id="user-text" 
          value={userText} 
          onChange={(e) => setUserText(e.target.value)} 
          rows="10" 
          className="w-full p-3 bg-black/20 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition shadow-sm text-white placeholder-gray-400" 
          placeholder="Paste your text here..."
        ></textarea>
      </div>
      <style jsx>{`
        .custom-file-upload {
          border: 2px dashed rgba(255, 255, 255, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          cursor: pointer;
          border-radius: 8px;
          color: #fbcfe8;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }
        .custom-file-upload:hover {
          border-color: #ec4899;
          color: #ec4899;
          background-color: rgba(236, 72, 153, 0.1);
        }
      `}</style>
    </div>
  );
}
