<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DoctorDocumentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,doctor_id',
            'type' => 'required|in:board_certificate,id_card',
            'document_name' => 'nullable|string',
            'file' => 'required|file|max:5120',
        ]);

        $path = $request->file('file')->store('doctor_documents', 'public');

        $doc = \App\Models\DoctorDocument::create([
            'doctor_id' => $request->doctor_id,
            'type' => $request->type,
            'document_name' => $request->document_name,
            'file_path' => $path,
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => $doc,
        ]);
    }

    public function getByDoctor($doctor_id)
    {
        return response()->json([
            'data' => \App\Models\DoctorDocument::where('doctor_id', $doctor_id)->get()
        ]);
    }
}