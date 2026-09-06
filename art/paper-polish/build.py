import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
mode = args[0] if args else 'experience'
mobile = 'mobile' in args
preview = 'preview' in args

def paper_material():
    mat = bpy.data.materials.new('MAT_Cotton_Stock')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    shader = nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value = 0.86
    coord = nodes.new('ShaderNodeTexCoord')
    grain = nodes.new('ShaderNodeTexNoise')
    grain.inputs['Scale'].default_value = 750 if mode == 'tabs' else 280
    grain.inputs['Detail'].default_value = 3
    links.new(coord.outputs['Object'], grain.inputs['Vector'])
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.35
    bump.inputs['Distance'].default_value = 0.0006 if mode == 'tabs' else 0.0008
    links.new(grain.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], shader.inputs['Normal'])
    tone = nodes.new('ShaderNodeValToRGB')
    tone.color_ramp.elements[0].position = 0.2
    tone.color_ramp.elements[0].color = (0.79, 0.78, 0.75, 1) if mode == 'tabs' else (0.64, 0.63, 0.59, 1)
    tone.color_ramp.elements[1].position = 0.8
    tone.color_ramp.elements[1].color = (0.93, 0.92, 0.89, 1) if mode == 'tabs' else (0.98, 0.97, 0.94, 1)
    links.new(grain.outputs['Fac'], tone.inputs[0])
    links.new(tone.outputs['Color'], shader.inputs['Base Color'])
    return mat

def curve(name, points, radius, material):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.bevel_depth = radius
    data.bevel_resolution = 4
    spline = data.splines.new('BEZIER')
    spline.bezier_points.add(len(points)-1)
    for p, co in zip(spline.bezier_points, points):
        p.co = co
        p.handle_left_type = 'AUTO'
        p.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    data.materials.append(material)
    return obj

if mode == 'tabs':
    variant = ('mobile' if mobile else 'desktop') + '-light'
    bpy.ops.wm.open_mainfile(filepath=str(ROOT.parent / 'optical-tray' / (variant + '.blend')))
    scene = bpy.context.scene
    paper = paper_material()
    tabs = [bpy.data.objects['Paper_' + name] for name in ['Work', 'Play', 'About']]
    for index, tab in enumerate(tabs):
        tab.data.materials.clear()
        tab.data.materials.append(paper)
        width = tab.dimensions.x
        vertices = []
        faces = []
        nx, nz = 32, 24
        radius = 0.003
        for j in range(nz + 1):
            z = (j / nz - 0.5) * 0.074
            corner = max(0, abs(z) - (0.037 - radius))
            half_width = width / 2 - radius + math.sqrt(max(0, radius * radius - corner * corner))
            for i in range(nx + 1):
                x = (i / nx * 2 - 1) * half_width
                y = 0.0016 * (j / nz)**2 * math.sin(x / width * 2 + index * 0.5)
                vertices.append((x, y, z))
        for j in range(nz):
            for i in range(nx):
                a = j * (nx + 1) + i
                faces.append((a, a + 1, a + nx + 2, a + nx + 1))
        surface = bpy.data.meshes.new(tab.name + '_Stock')
        surface.from_pydata(vertices, [], faces)
        surface.update()
        tab.data = surface
        tab.data.materials.append(paper)
        tab.modifiers.clear()
        for face in surface.polygons:
            face.use_smooth = True
        thickness = tab.modifiers.new('Stock_Thickness', 'SOLIDIFY')
        thickness.thickness = 0.0018
        bevel = tab.modifiers.new('Cut_Edge', 'BEVEL')
        bevel.width = 0.0002
        bevel.segments = 3
    scene.cycles.samples = 24 if preview else 192
    scene.render.resolution_percentage = 100
    out = ROOT / 'masters' / variant
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / (variant + '-paper.blend')))
    if preview:
        scene.render.filepath = str(out / 'assembled.png')
        bpy.ops.render.render(write_still=True)
    else:
        for obj in scene.objects:
            if obj.type in {'MESH', 'FONT', 'CURVE'}:
                obj.visible_camera = False
        for name in ['Glass_Pane', 'Glass_Edge', 'What_If']:
            bpy.data.objects[name].hide_render = True
        bpy.data.objects['Ground'].is_shadow_catcher = False
        scene.render.film_transparent = True
        for tab in tabs:
            tab.hide_render = False
            tab.visible_camera = True
            scene.render.filepath = str(out / (tab.name + '.png'))
            bpy.ops.render.render(write_still=True)
            tab.visible_camera = False
else:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 24 if preview else 192
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 900 if mobile else 1600
    scene.render.resolution_y = 1100 if mobile else 680
    scene.render.resolution_percentage = 65 if preview else 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.film_transparent = True
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    scene.view_settings.exposure = 0.28
    scene.world = bpy.data.worlds.new('World_Soft_Studio')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (1, 1, 1, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = 0.35
    paper = paper_material()
    edge_stock = paper.copy()
    edge_stock.name = 'MAT_Paper_Layer_Edges'
    ramp = next(node for node in edge_stock.node_tree.nodes if node.type == 'VALTORGB')
    ramp.color_ramp.elements[0].color = (0.46, 0.44, 0.38, 1)
    ramp.color_ramp.elements[1].color = (0.79, 0.77, 0.70, 1)
    width, height = (0.42, 0.49) if mobile else (1, 0.38)
    for layer in range(4):
        verts = []
        faces = []
        nx, ny = 50, 24
        for j in range(ny+1):
            y = (j / ny - 0.5) * height
            for i in range(nx+1):
                x = (i / nx - 0.5) * width
                curl = 0.0011 * (x / width + 0.5)**5 + 0.0004 * math.sin(x / width * 6) * (y / height + 0.5)**6
                verts.append((x + (3-layer)*0.0005, y-(3-layer)*0.0022, 0.010 + layer*0.0015 + curl))
        for j in range(ny):
            for i in range(nx):
                a = j*(nx+1)+i
                faces.append((a,a+1,a+nx+2,a+nx+1))
        mesh = bpy.data.meshes.new('Paper_Surface')
        mesh.from_pydata(verts, [], faces)
        mesh.update()
        obj = bpy.data.objects.new('SM_Index_Paper_' + str(layer), mesh)
        scene.collection.objects.link(obj)
        obj.data.materials.append(paper if layer == 3 else edge_stock)
        solid = obj.modifiers.new('Paper_Thickness', 'SOLIDIFY')
        solid.thickness = 0.00085
        bevel = obj.modifiers.new('Cut_Edge', 'BEVEL')
        bevel.width = 0.00013
        bevel.segments = 2
    metal = bpy.data.materials.new('MAT_Staple_Steel')
    metal.use_nodes = True
    shader = metal.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (0.24, 0.27, 0.29, 1)
    shader.inputs['Metallic'].default_value = 1
    shader.inputs['Roughness'].default_value = 0.18
    x = -width/2 + (0.019 if mobile else 0.038)
    y = height*0.01
    curve('SM_Staple', [(x,y-0.039,0.0146),(x,y-0.039,0.0158),(x,y-0.037,0.0168),(x,y+0.037,0.0168),(x,y+0.039,0.0158),(x,y+0.039,0.0146)],0.0028,metal)
    holes = bpy.data.materials.new('MAT_Staple_Punctures')
    holes.diffuse_color = (0.13, 0.12, 0.10, 1)
    for tip in [-0.039, 0.039]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.0038, location=(x,y+tip,0.01465))
        puncture = bpy.context.object
        puncture.name = 'SM_Staple_Puncture'
        puncture.scale = (0.75,1,0.12)
        puncture.data.materials.append(holes)
    bpy.ops.mesh.primitive_plane_add(size=200)
    ground = bpy.context.object
    ground.name = 'SM_Shadow_Catcher'
    ground.is_shadow_catcher = True
    for name, loc, energy, size in [('Key',(-0.08,0.8,1.0),65,1.1),('Fill',(0.6,-0.2,1.8),12,1.2)]:
        data = bpy.data.lights.new('LGT_'+name,'AREA')
        data.energy = energy
        data.size = size
        obj = bpy.data.objects.new('LGT_'+name,data)
        scene.collection.objects.link(obj)
        obj.location = loc
        obj.rotation_euler = (Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=(0,0,3))
    camera = bpy.context.object
    camera.name = 'CAM_Index_Ortho'
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 0.55 if mobile else 1.055
    scene.camera = camera
    group = bpy.data.collections.new('COL_Index_Stationery')
    scene.collection.children.link(group)
    for obj in list(scene.collection.objects):
        scene.collection.objects.unlink(obj)
        group.objects.link(obj)
    variant = 'experience-mobile' if mobile else 'experience-desktop'
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / (variant + '.blend')))
    scene.render.filepath = str(ROOT / 'masters' / (variant + '.png'))
    bpy.ops.render.render(write_still=True)
