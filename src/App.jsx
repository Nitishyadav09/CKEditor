import Navbar from './common/Navbar';
import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import axios from 'axios';
import CircularProgress from "./common/CircularProgress"
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Clipboard,
  Essentials,
  FindAndReplace,
  Font,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageUpload,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  ListProperties,
  MediaEmbed,
  MediaEmbedToolbar,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SpecialCharacters,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  TableColumnResize,
  TextTransformation,
  TableSelection,
  TableMouse,
  TableKeyboard,
  TableUI,
  TableUtils,
  TableClipboard,
  TodoList,
  Underline,
  Undo,
  WordCount,
  Mention,
  Bookmark,
  CloudServices,
  Base64UploadAdapter
} from 'ckeditor5';

import {ImportWord, ExportPdf, ExportWord, ImportWordEditing, ImportWordUI, FormatPainter, MultiLevelList, PasteFromOfficeEnhanced } from 'ckeditor5-premium-features';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import 'ckeditor5/ckeditor5.css';
import './App.css';

export default function App() {
  const [editorData, setEditorData] = useState('');
  const [files, setFiles] = useState(["Protocol_Document_Template.docx", "sample.docx"]);
  const [selectedFile, setSelectedFile] = useState('');

  const [editorInstance, setEditorInstance] = useState(null);
  const [toolboxPosition, setToolboxPosition] = useState({ top: 0, left: 0, visible: false });
  const selectedHtmlRef = useRef('');

  const [selectedText, setSelectedText] = useState("");
  const [suggestedText, setSuggestedText] = useState("");

  const [loader, setLoader] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const selectionTimeout = useRef(null);

  console.log(setFiles);

  const handleEditorChange = (event, editor) => {
    setEditorData(editor.getData());
  };
  
  // const handleSelectionChange = (editor) => {
  //   const selection = editor.model.document.selection;

  //   if (!selection.isCollapsed) {
  //     const selectedHtml = editor.data.stringify(editor.model.getSelectedContent(selection));
  //     selectedHtmlRef.current = selectedHtml;

  //     // Extract plain text from the selection
  //     let tempDiv = document.createElement("div");
  //     tempDiv.innerHTML = selectedHtml;
  //     let newText = tempDiv.innerText.trim();

  //     setSelectedText(newText);
  //     setSuggestedText(""); // Clear previous suggestion

  //     // Show toolbox near the selection
  //     editor.editing.view.change((writer) => {
  //       const viewSelection = editor.editing.view.document.selection;
  //       const range = viewSelection.getFirstRange();

  //       if (range) {
  //         // Get selected HTML
  //         const selectedHtml = editor.data.stringify(editor.model.getSelectedContent(selection));
  //         selectedHtmlRef.current = selectedHtml; // Store selected HTML

  //         // Get position of selected text for toolbox
  //         const domSelection = window.getSelection();
  //         if (domSelection.rangeCount > 0) {
  //           const rect = domSelection.getRangeAt(0).getBoundingClientRect();
  //           setToolboxPosition({
  //             top: rect.top + window.scrollY - 40,
  //             left: rect.left + window.scrollX,
  //             visible: true,
  //           });
  //         }
  //       }
  //     });
  //   } else {
  //     setToolboxPosition((prev) => ({ ...prev, visible: false }));
  //     setSelectedText("");
  //     setSuggestedText("");
  //     setShowSuggestion(false);
  //   }
  // };

  const handleSelectionChange = (editor) => {
    clearTimeout(selectionTimeout.current);
  
    selectionTimeout.current = setTimeout(() => {
      const selection = editor?.model?.document?.selection;
      if (!selection) return;
  
      if (!selection.isCollapsed) {
        try {
          const selectedHtml = editor.data.stringify(editor.model.getSelectedContent(selection));
          selectedHtmlRef.current = selectedHtml;
  
          // Extract plain text from the selection
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = selectedHtml;
          const newText = tempDiv.innerText.trim();
  
          setSelectedText(newText);
          setSuggestedText(""); // Clear previous suggestion
  
          // Show toolbox near the selection
          editor.editing.view.change(() => {
            const viewSelection = editor.editing.view.document.selection;
            const range = viewSelection?.getFirstRange();
  
            if (range) {
              const domSelection = window.getSelection();
              if (domSelection && domSelection.rangeCount > 0) {
                const rect = domSelection.getRangeAt(0).getBoundingClientRect();
                setToolboxPosition({
                  top: rect.top + window.scrollY - 40,
                  left: rect.left + window.scrollX,
                  visible: true,
                });
              }
            }
          });
        } catch (err) {
          console.warn('Selection handling error:', err);
        }
      } else {
        setToolboxPosition((prev) => ({ ...prev, visible: false }));
        setSelectedText("");
        setSuggestedText("");
        setShowSuggestion(false);
      }
    }, 60); // Debounce a little to smooth selection
  };

  useEffect(() => {
    if (!editorInstance) return;
  
    const onSelectionChange = () => handleSelectionChange(editorInstance);
  
    editorInstance.model.document.selection.on('change', onSelectionChange);
  
    return () => {
      clearTimeout(selectionTimeout.current);
      editorInstance.model.document.selection.off('change', onSelectionChange);
    };
  }, [editorInstance]);

  useEffect(() => {
    if (editorInstance) {
      editorInstance.model.document.selection.on("change", () => handleSelectionChange(editorInstance));
    }
  }, [editorInstance]);

  useEffect(() => {
    if (editorInstance) {
      const selectionHandler = () => handleSelectionChange(editorInstance);
      editorInstance.model.document.selection.on('change', selectionHandler);
      return () => editorInstance.model.document.selection.off('change', selectionHandler);
    }
  }, [editorInstance]);

  const preserveScrollPosition = (callback) => {
    const scrollY = window.scrollY;
    callback();
    window.scrollTo(0, scrollY);
  };
  
  useEffect(() => {
    if (editorInstance) {
      editorInstance.model.document.selection.on('change', () => {
        preserveScrollPosition(() => handleSelectionChange(editorInstance));
      });
    }
  }, [editorInstance]);

  const handleFileChange = async (event) => {
    setEditorData('');
    const fileName = event.target.value;
    setSelectedFile(fileName);

    if (editorInstance) {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}${fileName}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        // Read response as a Blob
        const blob = await response.blob();

        //Ensure it's a valid Word file
        const file = new File([blob], fileName, {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        //Execute importWord if CKEditor is ready
        editorInstance.execute("importWord",  file ); 

      } catch (error) {
        console.error("Error loading file:", error);
        alert("An error occurred while importing the Word file.");
      }
    }
  };
  
  const sendHtmlToBackend = async () => {
    setLoader(true);
    setShowSuggestion(true);
    setToolboxPosition({ top: 0, left: 0, visible: false });
    try {
      const response = await axios.post(
        "https://smart-suggest.azurewebsites.net/rag/stream/1/kesimpta",
        { sentence : selectedText },
        { headers: { "Content-Type": "application/x-www-form-urlencoded", } }
      );

      if (response.status === 200) {
        setLoader(false);
        setSuggestedText(response.data.corrected_sentence);
      } else {
        console.error("API response error:", response);
        alert("Failed to fetch suggestion.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error fetching suggestion.");
    }
  };

  const handleReplaceClick = () => {
    if (editorInstance && selectedHtmlRef.current && suggestedText) {
      let parser = new DOMParser();
      let doc = parser.parseFromString(editorInstance.getData(), "text/html");
  
      let traverseAndReplace = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // Replace only exact selected text in text nodes
          node.nodeValue = node.nodeValue.replace(selectedText, suggestedText);
        } else {
          // Recursively check child nodes
          node.childNodes.forEach(traverseAndReplace);
        }
      };
  
      traverseAndReplace(doc.body);
  
      let updatedEditorData = doc.body.innerHTML;
  
      // Update CKEditor content
      editorInstance.setData(updatedEditorData);
      setEditorData(updatedEditorData);
  
      // Reset states
      setToolboxPosition({ visible: false });
      setSelectedText("");
      setSuggestedText("");
      setShowSuggestion(false);
    }
  };
  

  return (
    <>
    <Navbar/>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: "1rem" }}>
      <div style={{width: "75vw", height:'84vh', minHeight:'84vh'}}>
      <CKEditor
        editor={ClassicEditor}
        
        config={{
          licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDY3NDg3OTksImp0aSI6IjlhNmUyNWJmLTI1ZmYtNGVlOS1hMjRjLTk0NTExZmQ1MWQzNiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjYzN2Y3NzFhIn0.MgOAEaUjmP28u-raogsDG6KvNLYMFezcnHdC96e7DtYmqhbeuztFnNgblfzgOAM-Z114KRSUUFL3ssndusl7bg',
          toolbar: [
            'importWord', 'exportPdf', 'exportWord', '|',
            'undo', 'redo', '|',
            'fontFamily', 'fontSize', 'fontColor', 'highlight', 'formatPainter', '|',
            'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
            'alignment', 'outdent', 'indent', '|',
            'link', 'insertTable', 'tableCellProperties', 'tableProperties', 'mergeTableCells', 'tableColumn', 'tableRow', '|',
            'mediaEmbed', 'ImageInsert', '|',
            'bulletedList', 'numberedList', 'todoList', 'multiLevelList', '|',
            'codeBlock', 'blockQuote', '|',
            'subscript', 'superscript', 'horizontalLine', '|',
            'removeFormat', 'findAndReplace', 'specialCharacters', '|',
          ],
          plugins: [
            ImportWordEditing, ImportWordUI,ImportWord, FormatPainter, MultiLevelList, PasteFromOfficeEnhanced, ExportPdf, ExportWord,
            Alignment,
            Autoformat,
            BlockQuote,
            Bold,
            Code,
            CodeBlock,
            Clipboard,
            Essentials,
            FindAndReplace,
            Font,
            FontColor,
            FontFamily,
            FontSize,
            Heading,
            Highlight,
            HorizontalLine,
            Image,
            ImageCaption,
            ImageInsert,
            ImageUpload,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            Base64UploadAdapter,
            Indent,
            IndentBlock,
            Italic,
            Link,
            List,
            ListProperties,
            MediaEmbed,
            MediaEmbedToolbar,
            Paragraph,
            PasteFromOffice,
            RemoveFormat,
            SpecialCharacters,
            Strikethrough,
            Subscript,
            Superscript,
            Table,
            TableCellProperties,
            TableProperties,
            TableToolbar,
            TableColumnResize, 
            TextTransformation,
            TableSelection,
            TableMouse,
            TableKeyboard,
            TableUI,
            TableUtils,
            TableClipboard,
            TodoList,
            Underline,
            Undo,
            WordCount,
            Mention,
            Bookmark,
            CloudServices 
          ],
          fontFamily: {
            options: [
              'default',
              'Arial, Helvetica, sans-serif',
              'Courier New, Courier, monospace',
              'Georgia, serif',
              'Lucida Sans Unicode, Lucida Grande, sans-serif',
              'Tahoma, Geneva, sans-serif',
              'Times New Roman, Times, serif',
              'Trebuchet MS, Helvetica, sans-serif',
              'Verdana, Geneva, sans-serif',
              'Comic Sans MS, cursive',
              'Impact, Charcoal, sans-serif',
              'Roboto, sans-serif',
              'Open Sans, sans-serif',
              'Lora, serif',
              'Montserrat, sans-serif',
              'Poppins, sans-serif',
              'Nunito, sans-serif',
              'Raleway, sans-serif',
              'Inter, sans-serif',
              'Fira Sans, sans-serif',
              'DM Sans, sans-serif',
              'Playfair Display, serif',
              'Merriweather, serif',
              'EB Garamond, serif',
              'Crimson Text, serif',
              'Libre Baskerville, serif',
              'Source Sans Pro, sans-serif',
              'Work Sans, sans-serif',
              'Rubik, sans-serif',
              'Manrope, sans-serif',
              'Lexend, sans-serif',
              'Jost, sans-serif',
              'Quicksand, sans-serif',
              'Titillium Web, sans-serif',
              'Ubuntu, sans-serif',
              'Oxygen, sans-serif',
              'Heebo, sans-serif',
              'Assistant, sans-serif',
              'Overpass, sans-serif',
              'Cairo, sans-serif',
              'Tajawal, sans-serif',
              'Barlow, sans-serif',
              'Karla, sans-serif',
              'Signika, sans-serif',
              'Varela Round, sans-serif',
              'Hind, sans-serif',
              'Questrial, sans-serif',
              'Bitter, serif',
              'Alegreya, serif',
              'Cormorant, serif',
              'Spectral, serif',
              'Source Serif Pro, serif',
              'Inknut Antiqua, serif',
              'PT Serif, serif',
              'Neuton, serif',
              'Vollkorn, serif',
              'Domine, serif',
              'Prata, serif',
              'Tinos, serif',
              'Abhaya Libre, serif',
              'Martel, serif',
              'Faustina, serif',
              'Gentium Book Basic, serif',
              'Sorts Mill Goudy, serif',
            ],
            supportAllValues: true
          },
          fontSize: {
            options: [
              '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'
            ],
            supportAllValues: true
          },
          table: {
            contentToolbar: [
              'tableColumn', 'tableRow', 'mergeTableCells'
            ],
            tableProperties: {
              // Disable figure wrapping for tables
              style: 'display: table;'
            },
            tableSelection: {
              enable: true, // Explicitly enable multiple cell selection
            }
          },
          image: {
            upload: {
              types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff']
            }
          },
          pasteFromOffice: {
            removeStyles: false,
            keepFormatting: true,
          },
        }}
        data={editorData}
        onChange={handleEditorChange}
        onReady={(editor) => setEditorInstance(editor)}
        onError={(error) => console.error("CKEditor Error:", error)}
      />
      
      {toolboxPosition.visible && (
        <div
        style={{
          position: 'absolute',
          top: `${toolboxPosition.top}px`,
          left: `${toolboxPosition.left}px`,
          background: '#fff',
          border: '1px solid #ddd',
          padding: '5px 10px',
          boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
          borderRadius: '5px',
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'top 0.2s ease-out, left 0.2s ease-out', // Smooth movement
        }}
        onClick={sendHtmlToBackend}
      >
        💡 Suggestion
      </div>
      )}
      </div>
      <div>
        <div style={{display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom: "0.5rem"}}>
        <h3 style={{textAlign:'left', margin:'0', color:"#1565c0"}}>Select File :</h3>
        <FormControl style={{ minWidth: 200, backgroundColor:'white' }}>
          <Select
            labelId="file-select-label"
            value={selectedFile}
            onChange={handleFileChange}
            displayEmpty
          >
            <MenuItem value="" disabled>-- Select a file --</MenuItem>
            {files.map((file, index) => {
              return(
              <MenuItem key={index} value={file}>
                {file}
              </MenuItem>
            )}
            )}
          </Select>
        </FormControl>
        </div>
        <div>
        {editorData && <h3 style={{textAlign:'left', margin:'0', color:"#1565c0"}}>Suggestion(s) :</h3>}
         {editorData && <div style={{border:"0.5px solid #cbcbcb", borderRadius:'5px', padding:'0.5rem', marginTop:'0.5rem', backgroundColor:'white'}}>
          <div style={{display:'flex', gap:'0.2rem', marginBottom: "0.7rem"}}>
            <p style={{fontWeight:"bold", margin:'0', minWidth: "120px"}}>Selected Text :</p>
            <p style={{margin:"0"}}>{selectedText || "No text selected"}</p>
          </div>
          {showSuggestion && <div style={{display:'flex', gap:'0.2rem', marginBottom: "0.7rem"}}>
            <p style={{fontWeight:"bold", margin:'0', minWidth: "100px"}}>Suggestion :</p>
            <p style={{margin:"0"}}>{loader ? <CircularProgress size={15}/> : suggestedText}</p>
          </div>}
          {suggestedText && <button style={{backgroundColor: "darkgreen", color: "white", padding: "0.3rem 0.8rem",  borderRadius: "0.2rem", cursor:"pointer"}} onClick={handleReplaceClick}>REPLACE</button>}
         </div>}
        </div>
      </div>
    </div>
    </>
  );
}