const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Alt görev başlığı zorunludur'],
        trim: true,
        maxlength: [100, 'Alt görev başlığı en fazla 100 karakter olabilir']
    },
    completed: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Görev başlığı zorunludur'],
        trim: true,
        minlength: [3, 'Başlık en az 3 karakter olmalı'],
        maxlength: [200, 'Başlık en fazla 200 karakter olabilir'],
    },
    description: {
        type: String,
        maxlength: [1000, 'Açıklama en fazla 1000 karakter olabilir'],
        default: ''
    },
    status: {
        type: String,
        enum: {
            values: ['todo', 'in-progress', 'done'],
            message: 'Geçersiz durum: {VALUE}. Geçerli değerler: todo, in-progress, done'
        },
        default: 'todo'
    },
    priority: {
        type: String,
        enum: {
            values: ['düşük', 'orta', 'yüksek', 'acil'],
            message: 'Geçersiz öncelik: {VALUE}. Geçerli değerler: düşük, orta, yüksek, acil'
        },
        default: 'orta'
    },
    category: {
        type: String,
        enum: {
            values: ['iş', 'kişisel', 'okul', 'sağlık', 'diğer'],
            message: 'Geçersiz kategori: {VALUE}. Geçerli değerler: iş, kişisel, okul, sağlık, diğer'
        },
        default: 'diğer'
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function (v) {
                if (this.isNew) return !v || v >= new Date(new Date().setHours(0, 0, 0, 0));
                return true;
            },
            message: 'Son tarih geçmişte olamaz'
        }
    },
    subtasks: [subtaskSchema],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Görevin sahibi olmalı']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Etiket en fazla 20 karakter olabilir']
    }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// VIRTUAL: Gecikme durumu
taskSchema.virtual('isOverdue').get(function () {
    return this.dueDate && this.dueDate < new Date() && this.status !== 'done';
});

// VIRTUAL: Tamamlanan alt görev oranı
taskSchema.virtual('subtaskProgress').get(function () {
    if (!this.subtasks.length) return 0;
    const done = this.subtasks.filter(s => s.completed).length;
    return Math.round((done / this.subtasks.length) * 100);
});

// INDEX: Performans için
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
