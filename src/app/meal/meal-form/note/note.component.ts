import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
