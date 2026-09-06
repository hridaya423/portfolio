import bpy
import math
import json
import sys
from pathlib import Path
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view

ROOT = Path(__file__).resolve().parent
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
mobile = 'mobile' in args
preview = 'preview' in args
draft = 'draft' in args
variant = ('mobile' if mobile else 'desktop') + '-light'
out = ROOT / ('qa/material-draft' if draft else 'masters') / variant
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24 if preview else 128
scene.cycles.use_denoising = True
scene.cycles.film_transparent_glass = True
scene.cycles.film_transparent_roughness = 0.1
scene.render.resolution_x = 900 if mobile else 1600
scene.render.resolution_y = 700 if mobile else 540
scene.render.resolution_percentage = 65 if preview else 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.film_transparent = True
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = -0.8
scene.world.color = (0.25, 0.25, 0.25)


def material(name, color, metallic=0, roughness=0.4):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return mat


metal = material('MAT_Brushed_Steel', (0.42, 0.43, 0.44), 1, 0.4)
nt = metal.node_tree
tex = nt.nodes.new('ShaderNodeTexNoise')
tex.inputs['Scale'].default_value = 45
tex.inputs['Detail'].default_value = 2
coord = nt.nodes.new('ShaderNodeTexCoord')
scale = nt.nodes.new('ShaderNodeVectorMath')
scale.operation = 'MULTIPLY'
scale.inputs[1].default_value = (0.65, 2, 4)
nt.links.new(coord.outputs['Generated'], scale.inputs[0])
nt.links.new(scale.outputs[0], tex.inputs['Vector'])
bump = nt.nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = 0.24
bump.inputs['Distance'].default_value = 0.0004
nt.links.new(tex.outputs['Fac'], bump.inputs['Height'])
nt.links.new(bump.outputs[0], nt.nodes.get('Principled BSDF').inputs['Normal'])
metalgrain = nt.nodes.new('ShaderNodeValToRGB')
metalgrain.color_ramp.elements[0].position = 0.2
metalgrain.color_ramp.elements[0].color = (0.24, 0.25, 0.26, 1)
metalgrain.color_ramp.elements[1].position = 0.8
metalgrain.color_ramp.elements[1].color = (0.5, 0.51, 0.52, 1)
nt.links.new(tex.outputs['Fac'], metalgrain.inputs[0])
nt.links.new(metalgrain.outputs['Color'], nt.nodes.get('Principled BSDF').inputs['Base Color'])
paper = material('MAT_Cotton_Paper', (0.87, 0.84, 0.76), 0, 0.88)
pn = paper.node_tree
noise = pn.nodes.new('ShaderNodeTexNoise')
noise.inputs['Scale'].default_value = 28
pb = pn.nodes.new('ShaderNodeBump')
pb.inputs['Strength'].default_value = 0.3
pb.inputs['Distance'].default_value = 0.0002
pn.links.new(noise.outputs['Fac'], pb.inputs['Height'])
pn.links.new(pb.outputs[0], pn.nodes.get('Principled BSDF').inputs['Normal'])
papergrain = pn.nodes.new('ShaderNodeValToRGB')
papergrain.color_ramp.elements[0].color = (0.73, 0.7, 0.63, 1)
papergrain.color_ramp.elements[1].color = (0.94, 0.92, 0.86, 1)
pn.links.new(noise.outputs['Fac'], papergrain.inputs[0])
pn.links.new(papergrain.outputs['Color'], pn.nodes.get('Principled BSDF').inputs['Base Color'])
glassmat = material('MAT_Clear_Glass', (0.98, 0.995, 1), 0, 0.025)
glassbsdf = glassmat.node_tree.nodes.get('Principled BSDF')
glassbsdf.inputs['Transmission Weight'].default_value = 1
glassbsdf.inputs['IOR'].default_value = 1.46
glassnodes = glassmat.node_tree
clear = glassnodes.nodes.new('ShaderNodeBsdfTransparent')
glassmix = glassnodes.nodes.new('ShaderNodeMixShader')
glassmix.inputs[0].default_value = 0.55
glassnodes.links.new(clear.outputs[0], glassmix.inputs[1])
glassnodes.links.new(glassbsdf.outputs[0], glassmix.inputs[2])
glassnodes.links.new(glassmix.outputs[0], glassnodes.nodes.get('Material Output').inputs['Surface'])
ink = material('MAT_Pencil_Ink', (0.018, 0.02, 0.02), 0, 0.8)
coral = material('MAT_Coral_Display', (0.65, 0.075, 0.025), 0.1, 0.38)
coral.node_tree.nodes.remove(coral.node_tree.nodes.get('Principled BSDF'))
hello_emission = coral.node_tree.nodes.new('ShaderNodeEmission')
hello_emission.inputs['Color'].default_value = (1, 0.19, 0.045, 1)
hello_emission.inputs['Strength'].default_value = 0.9
coral.node_tree.links.new(hello_emission.outputs[0], coral.node_tree.nodes.get('Material Output').inputs['Surface'])


def mesh(name, verts, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def rounded_loop(w, d, r, z):
    points = []
    for cx, cy, start in [(w / 2-r, d / 2-r, 0), (-w / 2+r, d / 2-r, 90), (-w / 2+r, -d / 2+r, 180), (w / 2-r, -d / 2+r, 270)]:
        for i in range(17):
            a = math.radians(start+i*90/16)
            points.append((cx+r*math.cos(a), cy+r*math.sin(a), z))
    return points


width = 0.60 if mobile else 1.0
profiles = [(width-0.016, 0.164, 0.028, 0.008), (width, 0.18, 0.035, 0.016), (width, 0.18, 0.035, 0.070), (width-0.006, 0.174, 0.032, 0.077), (width-0.024, 0.156, 0.026, 0.077), (width-0.029, 0.151, 0.023, 0.069), (width-0.025, 0.155, 0.023, 0.025), (width-0.038, 0.142, 0.020, 0.018)]
verts = [p for profile in profiles for p in rounded_loop(*profile)]
count = 68
frontfaces = []
backfaces = []
for ring in range(len(profiles)-1):
    for j in range(count):
        face = (ring*count+j, ring*count+(j+1)%count, (ring+1)*count+(j+1)%count, (ring+1)*count+j)
        target = frontfaces if all(verts[k][1] < -0.02 for k in face) else backfaces
        target.append(face)
backfaces.append(tuple(range((len(profiles)-1)*count, len(profiles)*count)))
tray = mesh('Tray_Shell', verts, backfaces, metal)
lip = mesh('Tray_Foreground_Lip', verts, frontfaces, metal)
for shell in [tray, lip]:
    shell.modifiers.new('Weighted_Normals', 'WEIGHTED_NORMAL')


def box(name, location, dimensions, radius, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = obj.modifiers.new('Soft_Edges', 'BEVEL')
    bevel.width = radius
    bevel.segments = 8
    obj.modifiers.new('Weighted_Normals', 'WEIGHTED_NORMAL')
    obj.data.materials.append(mat)
    return obj



def panel(name, location, dimensions, radius, mat):
    w, depth, h = dimensions
    loops = [rounded_loop(w, h, radius, y) for y in [-depth/2, depth/2]]
    vertices = [(x, y, z) for loop in loops for x, z, y in loop]
    faces = [tuple(reversed(range(68))), tuple(range(68, 136))]
    faces += [(j, (j+1)%68, (j+1)%68+68, j+68) for j in range(68)]
    obj = mesh(name, vertices, [tuple(reversed(face)) for face in faces], mat)
    obj.location = location
    bevel = obj.modifiers.new('Edge_Polish', 'BEVEL')
    bevel.width = 0.0006
    bevel.segments = 3
    obj.modifiers.new('Weighted_Normals', 'WEIGHTED_NORMAL')
    return obj


glassheight = 0.27 if mobile else 0.24
glass = panel('Glass_Pane', (-0.095 if not mobile else 0, 0.06, 0.037+glassheight/2), (width*0.73 if not mobile else width*0.89, 0.0035, glassheight), 0.014, glassmat)
glass.rotation_euler = (math.radians(-25), math.radians(-1.7), math.radians(-10))


bpy.context.view_layer.update()
edge_mat = material('MAT_Laminated_Glass_Edge', (0.3, 0.5, 0.55), 0.45, 0.28)
edge_nodes = edge_mat.node_tree
edge_coord = edge_nodes.nodes.new('ShaderNodeTexCoord')
edge_axis = edge_nodes.nodes.new('ShaderNodeSeparateXYZ')
edge_mix = edge_nodes.nodes.new('ShaderNodeMixRGB')
edge_mix.inputs[1].default_value = (0.12, 0.46, 0.54, 1)
edge_mix.inputs[2].default_value = (0.75, 0.39, 0.25, 1)
edge_nodes.links.new(edge_coord.outputs['Generated'], edge_axis.inputs[0])
edge_nodes.links.new(edge_axis.outputs['X'], edge_mix.inputs[0])
edge_nodes.links.new(edge_mix.outputs[0], edge_nodes.nodes.get('Principled BSDF').inputs['Base Color'])
edge_curve = bpy.data.curves.new('Glass_Edge', 'CURVE')
edge_curve.dimensions = '3D'
edge_curve.bevel_depth = 0.0009
edge_curve.bevel_resolution = 3
edge_spline = edge_curve.splines.new('POLY')
edge_points = rounded_loop(width*0.73 if not mobile else width*0.89, glassheight, 0.014, -0.002)
edge_spline.points.add(len(edge_points)-1)
for point, (x, z, y) in zip(edge_spline.points, edge_points):
    point.co = (x, y, z, 1)
edge_spline.use_cyclic_u = True
edge = bpy.data.objects.new('Glass_Edge', edge_curve)
scene.collection.objects.link(edge)
edge.matrix_world = glass.matrix_world.copy()
edge.data.materials.append(edge_mat)
fontpath = '/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf'
font = bpy.data.fonts.load(fontpath)
curve = bpy.data.curves.new('What_If_Editable_Lettering', 'FONT')
curve.body = 'what if?'
curve.font = font
curve.align_x = 'CENTER'
curve.size = 0.061 if not mobile else 0.049
curve.space_character = 1.2
curve.extrude = 0.00003
writing = bpy.data.objects.new('What_If', curve)
scene.collection.objects.link(writing)
writing.data.materials.append(ink)
writing.rotation_euler = (glass.rotation_euler.to_matrix() @ Euler((math.pi/2, 0, 0.035)).to_matrix()).to_euler()
writing.location = glass.matrix_world @ Vector((0, -0.0021, 0.015))

tabs = []
tabwidth = 0.125 if mobile else 0.113
centres = [-0.152, 0, 0.152] if mobile else [0.095, 0.225, 0.355]
for label, x in zip(['Work', 'Play', 'About'], centres):
    tabs.append(panel('Paper_'+label, (x, -0.045, 0.077), (tabwidth, 0.0014, 0.074), 0.009, paper))

letters = {'H':['101','101','111','101','101'], 'E':['111','100','110','100','111'], 'L':['100','100','100','100','111'], 'O':['111','101','101','101','111']}
x0 = -width/2+0.059
for idx, letter in enumerate('HELLO'):
    for row, line in enumerate(letters[letter]):
        for col, on in enumerate(line):
            if on == '1':
                bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=0.00135, location=(x0+(idx*4+col)*0.0038, -0.09025, 0.054-row*0.0038))
                dot = bpy.context.object
                dot.name = 'Display_Dot'
                dot.scale.y = 0.15
                dot.data.materials.append(coral)

groundmat = material('MAT_Ground', (0.69, 0.70, 0.72), 0, 0.78)
ground = box('Ground', (0, 0, -0.018), (200, 200, 0.04), 0, groundmat)
ground.is_shadow_catcher = True


def area(name, location, energy, size, color, target=(0, 0, 0.1)):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.shape = 'DISK'
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z', 'Y').to_euler()


area('LGT_Key_Softbox', (-1.3, -1.7, 2.7), 280, 2.5, (0.92, 0.96, 1))
area('LGT_Rim_Warm', (1.0, 0.6, 1.1), 150, 1.1, (1, 0.86, 0.75))
area('LGT_Edge_Cool', (-0.8, 0.4, 0.7), 100, 0.7, (0.62, 0.85, 1))
area('LGT_Front_Reflection', (0, -2, 0.8), 25, 1.3, (1, 1, 1))
area('LGT_Glass_Reflection', (-0.24, -1.1, 0.65), 3, 0.12, (1, 0.98, 0.95), (0, 0.02, 0.17))
glasslight = bpy.data.lights['LGT_Glass_Reflection']
glasslight.shape = 'RECTANGLE'
glasslight.size_y = 0.9
bpy.ops.object.camera_add(location=(0, -3, 0.68))
camera = bpy.context.object
camera.name = 'Camera_Locked'
target = Vector((0, 0, 0.157 if mobile else 0.146))
camera.rotation_euler = (target-camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 0.70 if mobile else 1.13
scene.camera = camera
bpy.context.view_layer.update()


def bounds(obj):
    projected = [world_to_camera_view(scene, camera, obj.matrix_world @ Vector(corner)) for corner in obj.bound_box]
    left = min(p.x for p in projected)
    top = 1-max(p.y for p in projected)
    return {'x': left, 'y': top, 'width': max(p.x for p in projected)-left, 'height': 1-min(p.y for p in projected)-top}


outline = [world_to_camera_view(scene, camera, glass.matrix_world @ vertex.co) for vertex in list(glass.data.vertices)[:68]]
manifest = {'glassOutline': [[p.x, 1-p.y] for p in outline], 'width': scene.render.resolution_x, 'height': scene.render.resolution_y, 'tabs': [bounds(t) for t in tabs], 'glass': bounds(glass)}
(out / 'geometry.json').write_text(json.dumps(manifest, indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str((out if draft else ROOT) / (variant+'.blend')))
scene.render.filepath = str(out / 'assembled.png')
bpy.ops.render.render(write_still=True)
if preview or 'still' in args:
    sys.exit(0)
for tab in tabs:
    tab.hide_render = True
scene.render.filepath = str(out / 'base.png')
bpy.ops.render.render(write_still=True)
scene.render.film_transparent = True
scene.cycles.samples = 48
ground.is_shadow_catcher = False
objects = [o for o in scene.objects if o.type in {'MESH', 'FONT', 'CURVE'}]
for obj in objects:
    obj.visible_camera = False
lip.visible_camera = True
for obj in objects:
    if obj.name.startswith('Display_Dot'):
        obj.visible_camera = True
scene.render.filepath = str(out / 'lip.png')
bpy.ops.render.render(write_still=True)
lip.visible_camera = False
for obj in objects:
    if obj.name.startswith('Display_Dot'):
        obj.visible_camera = False
glass.hide_render = True
edge.hide_render = True
writing.hide_render = True
for tab in tabs:
    tab.hide_render = False
    tab.visible_camera = True
    scene.render.filepath = str(out / (tab.name+'.png'))
    bpy.ops.render.render(write_still=True)
    tab.visible_camera = False
