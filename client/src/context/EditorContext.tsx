import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { MDPreview } from "../components/MDPreview";
import { NoteForm } from "../components/NoteForm";
import { useNotesContext } from "../hooks/useNotesContext";
import { Note, NoteFormData, formSchema } from "../utils/types";


export const EditorContextProvider = ({ isEdit, isView, isDuplicate }: { isEdit: boolean, isView: boolean, isDuplicate: boolean }) => {
    let defaultValues: NoteFormData = {
        title: '',
        content: '',
        open: false,
        allowedUsers: [],
        tags: []
    }
    const { id } = useParams();
    const { notes } = useNotesContext();

    if (isEdit || isView || isDuplicate) {
        const note: Note | undefined = notes.find((note: Note) => note._id === id);
        if (note) {
            defaultValues = {
                title: note.title,
                content: note.content,
                open: note.open,
                allowedUsers: note.allowedUsers || [],
                tags: note.tags || []
            }
        }
    }

    const methods = useForm<NoteFormData>({
        defaultValues,
        resolver: zodResolver(formSchema),
    });

    return (
        <FormProvider {...methods}>
            <div className="d-flex flex-md-row flex-column justify-content-center align-items-start m-0" >
                <NoteForm isEdit={isEdit} isView={isView} />
                <MDPreview isView={isView} />
            </div>
        </FormProvider>
    );
}
