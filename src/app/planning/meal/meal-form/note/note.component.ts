import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
	selector: 'cb-note',
	templateUrl: './note.component.html',
	styleUrls: ['./note.component.scss'],
})
export class NoteComponent {
	constructor(
		public dialogRef: MatDialogRef<NoteComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { content: string | undefined }
	) {}

	cancel() {
		this.dialogRef.close();
	}
}
