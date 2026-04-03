<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;
    protected $table = 'permissions';
    protected $fillable = ['role_id', 'menu_name', 'can_view', 'can_create', 'can_edit', 'can_delete'];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}
